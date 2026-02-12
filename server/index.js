import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 4000;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

app.post('/api/profiles/sync', async (req, res) => {
  try {
    const { user_id, email } = req.body || {};
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'supabase_not_configured' });
    }
    if (!user_id) {
      return res.status(400).json({ error: 'missing_user_id' });
    }
    const displayName =
      (email && email.split('@')[0]) || 'Member';
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: user_id,
          email: email || null,
          display_name: displayName,
        },
        { onConflict: 'id' },
      )
      .select()
      .single();
    if (error) {
      console.error('profiles_sync_error', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (e) {
    console.error('profiles_sync_catch_error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/products', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.json([]);
    }
    const { data, error } = await supabaseAdmin.from('products').select('*').limit(100);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data || []);
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/seed-products', async (req, res) => {
  try {
    const { products } = req.body || {};
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'supabase_not_configured' });
    }
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'invalid_products' });
    }
    const payload = products.map((p) => ({
      name: p.name,
      category: p.category,
      price: p.price,
      image: p.image,
      description: p.description || null,
      colors: p.colors || null,
      rating: p.rating || null,
      reviews: p.reviews || null,
      is_new: !!p.isNew,
      is_sale: !!p.isSale,
      is_limited: !!p.isLimited,
    }));
    const { error } = await supabaseAdmin.from('products').insert(payload);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items, customerEmail, userId } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'invalid_items' });
    }
    let orderId = null;
    if (supabaseAdmin) {
      const total = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.quantity || 1), 0);
      const { data: order, error: orderErr } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId || null,
          email: customerEmail || null,
          total,
          status: 'pending',
        })
        .select()
        .single();
      if (orderErr) {
        return res.status(500).json({ error: orderErr.message });
      }
      orderId = order.id;
      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity || 1,
        size: i.selectedSize || null,
        color: i.selectedColor || null,
      }));
      const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(orderItems);
      if (itemsErr) {
        return res.status(500).json({ error: itemsErr.message });
      }
    }
    if (!stripe) {
      return res.json({ simulate: true, orderId });
    }
    const lineItems = items.map((i) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: i.name },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: i.quantity || 1,
    }));
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerEmail || undefined,
      success_url: `${FRONTEND_URL}/#/order-confirmation?orderId=${orderId || ''}`,
      cancel_url: `${FRONTEND_URL}/#/checkout`,
      client_reference_id: orderId || undefined,
    });
    res.json({ url: session.url, orderId });
  } catch (e) {
    console.error('create_checkout_session_error', e);
    res.status(500).json({ error: 'stripe_error' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { email, user_id, items, total, status } = req.body || {};
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'supabase_not_configured' });
    }
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        email: email || null,
        user_id: user_id || null,
        total: total || 0,
        status: status || 'paid',
      })
      .select()
      .single();
    if (orderErr) {
      return res.status(500).json({ error: orderErr.message });
    }
    if (Array.isArray(items) && items.length > 0) {
      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity || 1,
        size: i.selectedSize || null,
        color: i.selectedColor || null,
      }));
      const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(orderItems);
      if (itemsErr) {
        return res.status(500).json({ error: itemsErr.message });
      }
    }
    res.json({ id: order.id });
  } catch (e) {
    console.error('orders_create_error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

app.put('/api/orders/:id/paid', async (req, res) => {
  try {
    const { id } = req.params;
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'supabase_not_configured' });
    }
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ id: data.id });
  } catch (e) {
    console.error('orders_paid_error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/support/messages', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.json([]);
    }
    const { data, error } = await supabaseAdmin
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) {
      console.error('support_messages_query_error', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data || []);
  } catch (e) {
    console.error('support_messages_get_error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/my-orders', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'supabase_not_configured' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'missing_user_id' });
    }
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id,total,status,created_at,order_items(id,name,price,quantity,size,color)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('my_orders_error', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(orders || []);
  } catch (e) {
    console.error('my_orders_catch_error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/support/messages', async (req, res) => {
  try {
    const { user_id, role, text } = req.body || {};
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'supabase_not_configured' });
    }
    const { data, error } = await supabaseAdmin
      .from('support_messages')
      .insert({
        user_id: user_id || null,
        role: role || 'user',
        text: text || '',
      })
      .select()
      .single();
    if (error) {
      console.error('support_messages_insert_error', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (e) {
    console.error('support_messages_error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/support/ai-reply', async (req, res) => {
  try {
    const { conversation } = req.body || {};
    if (!Array.isArray(conversation) || conversation.length === 0) {
      return res.status(400).json({ error: 'invalid_conversation' });
    }
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'minimax_not_configured' });
    }
    const baseUrl = process.env.MINIMAX_BASE_URL || 'https://api.minimax.io/anthropic';
    const rawModel = process.env.MINIMAX_MODEL || 'MiniMax-M2.1';
    const model = rawModel.startsWith('minimax/') ? rawModel.slice('minimax/'.length) : rawModel;
    const messages = conversation.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: [
        {
          type: 'text',
          text: m.text || '',
        },
      ],
    }));
    const payload = {
      model,
      max_tokens: 800,
      system: 'You are a helpful customer support assistant for the JIELAN shoe store. Answer concisely in the same language as the user.',
      messages,
    };
    const resp = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) {
      console.error('minimax_error', resp.status, data);
      return res.status(500).json({ error: 'minimax_request_failed' });
    }
    const blocks = data && Array.isArray(data.content) ? data.content : [];
    const textBlock = blocks.find((b) => b.type === 'text');
    const replyText = textBlock && textBlock.text ? textBlock.text : 'Sorry, I could not generate a response.';
    res.json({ reply: replyText });
  } catch (e) {
    console.error('ai_reply_error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

// --- Xnova Payment Integration ---
app.post('/api/xnova/create-payment', async (req, res) => {
  try {
    const { items, customerEmail, userId, card } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'invalid_items' });
    }

    // 1. Create order in Supabase
    let orderId = null;
    let total = 0;
    if (supabaseAdmin) {
      // FORCE PRICE TO 0.01 FOR TESTING
      total = items.reduce((sum, i) => sum + 0.01 * (i.quantity || 1), 0);
      const { data: order, error: orderErr } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId || null,
          email: customerEmail || null,
          total,
          status: 'pending',
        })
        .select()
        .single();

      if (orderErr) {
        return res.status(500).json({ error: orderErr.message });
      }
      orderId = order.id;

      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        name: i.name,
        price: 0.01, // Force 0.01
        quantity: i.quantity || 1,
        size: i.selectedSize || null,
        color: i.selectedColor || null,
      }));
      await supabaseAdmin.from('order_items').insert(orderItems);
    } else {
        // Fallback for dev without supabase
        orderId = 'TEST_' + Date.now();
        // FORCE PRICE TO 0.01 FOR TESTING
        total = items.reduce((sum, i) => sum + 0.01 * (i.quantity || 1), 0);
    }

    // 2. Prepare Xnova Payload
    const merchantId = process.env.XNOVA_MERCHANT_ID;
    const signKey = process.env.XNOVA_API_SECRET; 
    const rawApiBaseUrl = process.env.XNOVA_API_BASE_URL || '';
    const apiBaseUrl = rawApiBaseUrl && rawApiBaseUrl.includes('/authorise')
      ? rawApiBaseUrl
      : 'https://test-api.xnova.sg/v1/authorise';
    const notifyUrl = process.env.XNOVA_NOTIFY_URL;
    const accountId = process.env.XNOVA_API_KEY; // Using API_KEY as Account ID/Gateway Number

    if (!merchantId || !apiBaseUrl) {
      console.error('Xnova config missing');
      return res.status(500).json({ error: 'xnova_not_configured' });
    }

    // Format Date: yyyyMMddHHmmss
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timestamp = now.getUTCFullYear() +
                      pad(now.getUTCMonth() + 1) +
                      pad(now.getUTCDate()) +
                      pad(now.getUTCHours()) +
                      pad(now.getUTCMinutes()) +
                      pad(now.getUTCSeconds());

    // Clean URLs
    const cleanNotifyUrl = String(notifyUrl || '').trim().replace(/[`'"]/g, '');
    const cleanReturnUrl = String(`${FRONTEND_URL}/#/order-confirmation?orderId=${orderId}`).trim().replace(/[`'"]/g, '');

    // Format Items String and Cart Items Array
    let itemsStr = '';
    let cartItems = [];
    if (Array.isArray(items)) {
       itemsStr = items.map((i, idx) => {
         const sku = i.id || `SKU${idx}`;
         const price = (Number(i.price) || 0).toFixed(2);
         const qty = i.quantity || 1;
         const safeName = (i.name || 'Item').replace(/[#;]/g, ' ');
         return `${safeName}#,#${sku}#,#${price}#,#${qty}#`;
       }).join(';');
       
       cartItems = items.map((i) => ({
           basic_item_data: {
               name: i.name || 'Item',
               quantity: String(i.quantity || 1),
               type: 'Goods',
               price: {
                   amount_usd: Number(i.price) || 0,
                   amount_local_currency: Number(i.price) || 0,
                   currency: 'USD'
               },
               category: 'Shoes',
               productId: String(i.id || '')
           }
       }));
    }

    const firstName =
      (customerEmail && customerEmail.split('@')[0]) || 'Customer';
    const lastName = 'User';
    
    const safeEmail = customerEmail || 'guest@example.com';
    
    let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (userIp === '::1') userIp = '127.0.0.1';

    // Mock additional amounts (for now assuming tax/shipping included or free)
    const amountStr = total.toFixed(2);
    const itemTotalStr = total.toFixed(2);
    const shippingStr = '0.00';
    const handlingStr = '0.00';
    const taxTotalStr = '0.00';

    // Direct API Payload
    const referrerUrl = FRONTEND_URL.replace(/\/$/, '');

    const payload = {
      merchant_id: merchantId,
      account_id: accountId,
      order_no: String(orderId),
      currency: 'USD',
      amount: amountStr,
      item_total: itemTotalStr,
      shipping: shippingStr,
      handling: handlingStr,
      tax_total: taxTotalStr,
      shipping_discount: '0.00',
      discount: '0.00',
      website: FRONTEND_URL.replace(/^https?:\/\//, ''),
      items: itemsStr,
      cart_items: cartItems,
      first_name: firstName,
      last_name: lastName,
      shopper_id: userId || safeEmail,
      shopper_email: safeEmail,
      shopper_ip: userIp,
      shopper_level: '1',
      notify_url: cleanNotifyUrl,
      // return_url: cleanReturnUrl, // Removed per user request
      request_time: timestamp,
      
      // Card Info (Direct API)
      card: card ? card.no : '',
      expiration_month: card ? card.expMonth : '',
      expiration_year: card ? card.expYear : '',
      security_code: card ? card.cvv : '',
      
      // Billing info
      billing_country: 'US',
      billing_state: 'NY',
      billing_city: 'New York',
      billing_address: '123 Main St',
      billing_postal_code: '10001',
      
      // Delivery info (mirror billing for now)
      delivery_firstname: firstName,
      delivery_lastname: lastName,
      delivery_country: 'US',
      delivery_state: 'NY',
      delivery_city: 'New York',
      delivery_address: '123 Main St',
      delivery_postal_code: '10001',

      // Tech info
      browser_lang: 'en-US',
      time_zone: '8',
      resolution: '1920x1080',
      device_type: 'PC',
      order_type: 'WEB',
      user_agent: req.headers['user-agent'] || 'Mozilla/5.0'
    };

    const cardNoForSign = payload.card || '';
    const expYearForSign = payload.expiration_year || '';
    const expMonthForSign = payload.expiration_month || '';
    const cvvForSign = payload.security_code || '';

    const signBase =
      String(merchantId) +
      String(accountId) +
      String(orderId) +
      'USD' +
      amountStr +
      firstName +
      lastName +
      cardNoForSign +
      expYearForSign +
      expMonthForSign +
      cvvForSign +
      safeEmail +
      signKey;

    const signature = crypto
      .createHash('sha256')
      .update(signBase, 'utf8')
      .digest('hex');

    const finalPayload = { 
      ...payload, 
      encryption_data: signature
    };

    // 4. Send Request to Xnova
    console.log('Sending to Xnova:', apiBaseUrl, finalPayload);
    // Note: If Xnova expects form-data, use URLSearchParams or a form-data lib.
    // Assuming JSON here.
    const reqFormat = (process.env.XNOVA_REQUEST_FORMAT || 'form').toLowerCase();
    
    const commonHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'http://localhost:3000/', // Using localhost as Referer for local testing
        'Origin': 'http://localhost:3000'
    };

    let resp;
    if (reqFormat === 'json') {
      resp = await fetch(apiBaseUrl, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            ...commonHeaders
        },
        body: JSON.stringify(finalPayload),
      });
    } else {
      const params = new URLSearchParams();
      Object.entries(finalPayload).forEach(([k, v]) => params.append(k, String(v)));
      resp = await fetch(apiBaseUrl, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            ...commonHeaders
        },
        body: params,
      });
    }

    const contentType = resp.headers.get('content-type') || '';
    const text = await resp.text();
    console.log('Xnova Status:', resp.status, contentType, 'len=', text.length);
    // DEBUG: Always print raw text to see what Xnova returned
    console.log('Xnova Raw Body:', text);

    let data = null;
    const trimmed = text.trim();
    
    // Try Parsing XML if it starts with <
    if (trimmed.startsWith('<')) {
        try {
            // Simple regex parser for flat XML (sufficient for this response)
            // <key>value</key>
            data = {};
            const regex = /<([^>]+)>([^<]*)<\/\1>/g;
            let match;
            while ((match = regex.exec(trimmed)) !== null) {
                data[match[1]] = match[2];
            }
            console.log('Parsed XML Data:', data);
        } catch (e) {
            console.error('XML parsing failed:', e);
        }
    }
    // Try JSON
    else if (contentType.includes('application/json') || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Xnova response parse error:', e);
        return res.status(500).json({ error: 'xnova_response_error', raw: text });
      }
    }

    console.log('Xnova Response:', data);
    
    // 5. Handle Result
    // Check if response is HTML (direct page content)
    if (contentType.includes('text/html')) {
        // If it's a full HTML page, we might need to display it or extract a redirect
        // For now, let's look for a specific redirect URL pattern in the HTML or just return the HTML content
        // Simple heuristic: If it contains a form with action, it might be a POST redirect
        // But since frontend expects JSON { url: ... }, we have a mismatch if the API returns raw HTML.
        
        // Strategy: If HTML is returned, it likely means we hit the payment page directly.
        // But we called it via Server-to-Server (S2S). 
        // Hosted APIs usually work in two ways:
        // 1. S2S returns JSON { url: ... } -> Frontend redirects. (Preferred)
        // 2. Browser Form Post -> Returns HTML. (Legacy)
        
        // If we are getting HTML here, it means the API endpoint we used (`v1/payment`) might be designed for Form POST from browser, NOT JSON S2S.
        // However, if we must handle it:
        // Let's try to extract a URL if possible, or tell frontend to render this HTML.
        
        // Hack: If we receive HTML, we assume the API call itself *was* the payment page generation.
        // We can't easily display raw HTML in the frontend redirect flow without an iframe or new window.
        // Let's log this clearly.
        console.log('Received HTML from Xnova. This endpoint might expect a Form POST from the browser, not a JSON API call.');
        
        // If the HTML contains a window.location or meta refresh, extract it.
        const urlMatch = text.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
        if (urlMatch && urlMatch[1]) {
             return res.json({ url: urlMatch[1], orderId });
        }
        
        // If no URL found, return error with raw HTML for debugging
        return res.status(400).json({ error: 'received_html_instead_of_json', raw: text.substring(0, 500) + '...' });
    }

    // 6. Handle 3DS flow via issuer_url (JSON response)
    if (data && data.issuer_url) {
      try {
        const decodedIssuer = String(data.issuer_url).replace(/&amp;/g, '&');
        const issuerUrlObj = new URL(decodedIssuer);

        const returnUrl = `${FRONTEND_URL}/#/order-confirmation?orderId=${orderId}`;
        if (!issuerUrlObj.searchParams.has('return_url')) {
          issuerUrlObj.searchParams.set('return_url', returnUrl);
        }
        if (!issuerUrlObj.searchParams.has('notify_url') && cleanNotifyUrl) {
          issuerUrlObj.searchParams.set('notify_url', cleanNotifyUrl);
        }

        const finalIssuerUrl = issuerUrlObj.toString();
        console.log('Using issuer_url for 3DS:', finalIssuerUrl);
        return res.json({ url: finalIssuerUrl, orderId });
      } catch (e) {
        console.error('issuer_url_parse_error', e, data.issuer_url);
      }
    }

    const rawStatus =
      data &&
      (data.order_status ??
       data.OrderStatus ??
       data.status ??
       data.Status);

    if (rawStatus && String(rawStatus) === '1' && (data.payment_url || data.url || data.redirect_url)) {
      res.json({ url: data.payment_url || data.url || data.redirect_url, orderId });
    } else if (rawStatus && String(rawStatus) === '1') {
      res.json({ url: `${FRONTEND_URL}/#/order-confirmation?orderId=${orderId}`, orderId });
    } else {
      console.error('Xnova Payment Failed:', data);
      res.status(400).json({ error: 'payment_creation_failed', details: data || { raw: text, status: resp.status } });
    }

  } catch (e) {
    console.error('xnova_create_error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

// Xnova Webhook
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

app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
