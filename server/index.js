import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
