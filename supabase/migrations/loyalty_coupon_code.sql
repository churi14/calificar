alter table loyalty_transactions
  add column if not exists coupon_code text;
