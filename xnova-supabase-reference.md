# Xnova + Supabase（Webhook 同步）参考实现（脱敏版，含代码对照）

适用场景：**Xnova 后台显示支付成功，但 Supabase 数据库 `orders.status` 不更新**。最常见根因不是“更新逻辑写错”，而是：

- webhook 根本没投递进你的服务器（域名/端口/证书/安全组/反代路由问题）
- webhook 到了但 body 没解析出来（只解析 JSON 没解析表单）
- 解析到了但字段名不一致导致提取不到 orderId/status（`order_no` vs `order_id` 等）
- Supabase 写入权限问题（误用 anon key / RLS）

本文档基于本仓库的可运行实现，**把关键实现逻辑、可对照的代码位置、以及关键代码片段都复制出来**，你可以直接照抄到 FastAPI（Python）里做对比。

> 注意：本文档不包含任何密钥值；不要把 `.env*` 之类的密钥文件提交到公开仓库或发给第三方。

---

## 0) 本仓库的线上“固定 URL”策略（强烈推荐）

结论：**notify_url/return_url 一律通过环境变量写死公网 HTTPS URL**，不要用 request.host 动态拼。

原因：上了 Nginx/SLB/Ingress 后，`Host/Proto` 常常不可信，动态拼 URL 很容易拼出：

- `http://127.0.0.1:8000/...`
- `http://internal-lb/...`
- `http`（网关回调通常要求 https）

本仓库用到的关键环境变量名（仅字段名）：

- `XNOVA_API_BASE_URL`
- `XNOVA_NOTIFY_URL`
- `XNOVA_REQUEST_FORMAT`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 1) Webhook / Notify：回调入口如何写（必看）

### 1.1 路由与代码位置

- 路由：`POST /api/xnova/notify`
- 代码位置： [server/index.js:L816-L839](file:///c:/Users/zlsj/Desktop/DLZ/jielan/server/index.js#L816-L839)

### 1.2 Webhook handler 核心代码（脱敏摘取）

```js
app.post('/api/xnova/notify', async (req, res) => {
  try {
    const body = req.body || {};
    console.log('Xnova Notify received:', body);

    const orderId = body.order_id || body.order_no || body.OrderNo || body.OrderID;
    const isPaid =
      body.order_status === '1' ||
      body.OrderStatus === '1' ||
      body.status === 'success' ||
      body.Status === 'Success';
    const status = isPaid ? 'paid' : 'failed';

    if (status === 'paid' && orderId && supabaseAdmin) {
      await supabaseAdmin.from('orders').update({ status: 'paid' }).eq('id', orderId);
    }

    res.send('success');
  } catch (e) {
    console.error('xnova_notify_error', e);
    res.status(500).send('error');
  }
});
```

### 1.3 解析请求体：JSON + x-www-form-urlencoded（表单）同时支持

如果你的日志里**始终看不到 webhook 命中**，那首先是“请求没到服务器”。但如果能命中却 `body` 为空，那一般是“没启用表单解析”。

本仓库的解析配置：

- 代码位置： [server/index.js:L14-L17](file:///c:/Users/zlsj/Desktop/DLZ/jielan/server/index.js#L14-L17)

```js
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
```

对应 FastAPI（对照写法）：

- `application/json`：`await request.json()`
- `application/x-www-form-urlencoded`：`await request.form()`
- 如果 Xnova 发 XML：`await request.body()` 然后自行解析

### 1.4 字段名：orderId/status 怎么提取（兼容策略）

订单号提取（兼容多命名）：

```js
const orderId = body.order_id || body.order_no || body.OrderNo || body.OrderID;
```

成功状态判断（兼容两类返回）：

```js
const isPaid =
  body.order_status === '1' ||
  body.OrderStatus === '1' ||
  body.status === 'success' ||
  body.Status === 'Success';
```

解释：

- **`order_status === '1'`**：常见于网关 XML/表单风格返回（你之前日志就是 `'0'/'1'`）
- **`status === 'success'`**：兼容 JSON 风格/大小写差异

### 1.5 回调成功返回什么（为什么返回纯文本）

本仓库返回：

```js
res.send('success');
```

原因：很多支付网关对 webhook 要求“**2xx + 固定文本**”，返回 JSON 有时也能被接受，但为了最大兼容性这里用纯文本。

### 1.6 是否做验签（signature/encryption_data）？

本仓库的 webhook handler **没有做验签**。我们只做：

- 能解析到 body（JSON+表单）
- 能提取到 orderId/status（多字段兼容）
- 更新数据库（service role）

如果你需要验签：必须以 Xnova 官方给的 webhook 签名字段与顺序为准；不同网关差异很大，不能凭空假设。

---

## 2) Supabase：如何更新 orders.status = paid（以及权限/RLS）

### 2.1 使用的客户端类型

后端用 service role 创建 `supabaseAdmin`（具备更新权限，适合后端使用）：

- 代码位置： [server/index.js:L20-L29](file:///c:/Users/zlsj/Desktop/DLZ/jielan/server/index.js#L20-L29)

```js
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;
```

### 2.2 更新语句（与本项目一致）

- 代码位置： [server/index.js:L830-L832](file:///c:/Users/zlsj/Desktop/DLZ/jielan/server/index.js#L830-L832)

```js
await supabaseAdmin.from('orders').update({ status: 'paid' }).eq('id', orderId);
```

RLS 排雷要点：

- 若你使用 `service role key` 的后端 client，通常可以绕过 RLS
- 若你误用了 `anon key` 或把更新放在前端，极容易出现“支付成功但写库失败”的 RLS 问题

---

## 3) Create Payment：notify_url 固定、请求格式、响应解析、3DS issuer_url 处理

### 3.1 路由与代码位置

- 路由：`POST /api/xnova/create-payment`
- 代码位置： [server/index.js:L454-L814](file:///c:/Users/zlsj/Desktop/DLZ/jielan/server/index.js#L454-L814)

### 3.2 notify_url 取值方式（固定 + 清洗）

- 代码位置： [server/index.js:L504-L603](file:///c:/Users/zlsj/Desktop/DLZ/jielan/server/index.js#L504-L603)

摘取关键代码：

```js
const notifyUrl = process.env.XNOVA_NOTIFY_URL;
const cleanNotifyUrl = String(notifyUrl || '').trim().replace(/[`'"]/g, '');
...
notify_url: cleanNotifyUrl,
```

典型最终值示例（你的线上应当类似）：

```text
https://<your-domain>/api/xnova/notify
```

### 3.3 请求格式：JSON vs x-www-form-urlencoded（推荐 form）

此仓库通过环境变量 `XNOVA_REQUEST_FORMAT` 控制：

- 代码位置： [server/index.js:L670-L700](file:///c:/Users/zlsj/Desktop/DLZ/jielan/server/index.js#L670-L700)

```js
const reqFormat = (process.env.XNOVA_REQUEST_FORMAT || 'form').toLowerCase();

let resp;
if (reqFormat === 'json') {
  resp = await fetch(apiBaseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...commonHeaders },
    body: JSON.stringify(finalPayload),
  });
} else {
  const params = new URLSearchParams();
  Object.entries(finalPayload).forEach(([k, v]) => params.append(k, String(v)));
  resp = await fetch(apiBaseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...commonHeaders },
    body: params,
  });
}
```

结论：为了兼容性，本仓库线上默认用 `application/x-www-form-urlencoded`。

### 3.4 响应解析：XML / JSON / HTML 三分支

- 代码位置： [server/index.js:L702-L770](file:///c:/Users/zlsj/Desktop/DLZ/jielan/server/index.js#L702-L770)

关键策略：

- 若返回 body 以 `<` 开头：按 XML（用正则拉平解析）
- 若 `content-type` 是 `application/json`：按 JSON.parse
- 若 `content-type` 是 `text/html`：尝试提取 `window.location.href` 作为跳转链接

### 3.5 3DS issuer_url：&amp; 解码 + 补齐 return_url/notify_url

- 代码位置： [server/index.js:L772-L792](file:///c:/Users/zlsj/Desktop/DLZ/jielan/server/index.js#L772-L792)

完整补齐逻辑（脱敏摘取）：

```js
if (data && data.issuer_url) {
  const decodedIssuer = String(data.issuer_url).replace(/&amp;/g, '&');
  const issuerUrlObj = new URL(decodedIssuer);

  const returnUrl = `${FRONTEND_URL}/#/order-confirmation?orderId=${orderId}`;
  if (!issuerUrlObj.searchParams.has('return_url')) {
    issuerUrlObj.searchParams.set('return_url', returnUrl);
  }
  if (!issuerUrlObj.searchParams.has('notify_url') && cleanNotifyUrl) {
    issuerUrlObj.searchParams.set('notify_url', cleanNotifyUrl);
  }

  return res.json({ url: issuerUrlObj.toString(), orderId });
}
```

说明：

- 你如果只在“创建支付”的 payload 里设置 notify_url，但 issuer_url 跳转链路里最终没有 notify_url，有些网关/模式下会导致回调不触发或投递到旧地址
- 所以这里做了“双保险”：issuer_url 若缺参数则补齐

---

## 4) 主动查询订单（Query Status）：本仓库的结论

本仓库没有实现订单状态轮询（query），完全依赖 webhook。

如果你访问 `https://api.xnova.sg/v1/query` 返回 404：

- 大概率该路径不是公开 query API（至少在你当前环境不可用）
- 本仓库创建支付用的测试域名是 `https://test-api.xnova.sg/v1/authorise`（环境/域名可能不同）

建议：

- 让 Xnova 支持明确给出“查询订单状态 API”的**正确 endpoint、请求参数、签名规则**
- 在没有可靠 query API 的情况下，优先把 webhook 做到“必达 + 可重试 + 幂等更新”

---

## 5) 你看不到任何 webhook 命中：排查顺序（阿里云/反代通用）

当你“应用日志里完全没有 POST /api/payment/webhook 命中记录”时，优先按下面顺序排查（最快收敛）：

1) 网关后台是否有投递/重试日志（必须能看到 HTTP 状态码/失败原因）
2) 入口层日志（比应用日志更关键）
   - SLB / CDN / WAF / Nginx access log 里是否出现该 path 的 POST
   - 如果入口层都没有，说明请求压根没到你的机器（DNS/安全组/端口/证书/域名解析）
3) 临时把 notify_url 指向回显服务验证可达性
   - 若回显服务能收到而你服务器收不到：基础设施/路由问题
   - 若回显服务也收不到：notify_url 未被接受或 Xnova 未投递
4) 请求到了但 body 为空：检查 FastAPI 是否解析了 form（`await request.form()`）
5) body 有了但不更新：检查字段名兼容 + Supabase key/RLS

