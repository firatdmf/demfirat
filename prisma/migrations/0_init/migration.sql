-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_group" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,

    CONSTRAINT "auth_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_group_permissions" (
    "id" BIGSERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "auth_group_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_permission" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "content_type_id" INTEGER NOT NULL,
    "codename" VARCHAR(100) NOT NULL,

    CONSTRAINT "auth_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_user" (
    "id" SERIAL NOT NULL,
    "password" VARCHAR(128) NOT NULL,
    "last_login" TIMESTAMPTZ(6),
    "is_superuser" BOOLEAN NOT NULL,
    "username" VARCHAR(150) NOT NULL,
    "first_name" VARCHAR(150) NOT NULL,
    "last_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "is_staff" BOOLEAN NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "date_joined" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "auth_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_user_groups" (
    "id" BIGSERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "auth_user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_user_user_permissions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "auth_user_user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authentication_member" (
    "id" BIGSERIAL NOT NULL,
    "user_id" INTEGER,

    CONSTRAINT "authentication_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_company" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "backgroundInfo" VARCHAR(400) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "website" VARCHAR(200) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "crm_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_contact" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "zip_code" VARCHAR(10) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "birthday" DATE,
    "company_name" VARCHAR(255) NOT NULL,
    "job_title" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "company_id" BIGINT,

    CONSTRAINT "crm_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_note" (
    "id" BIGSERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "modified_date" TIMESTAMPTZ(6) NOT NULL,
    "company_id" BIGINT,
    "contact_id" BIGINT,

    CONSTRAINT "crm_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_admin_log" (
    "id" SERIAL NOT NULL,
    "action_time" TIMESTAMPTZ(6) NOT NULL,
    "object_id" TEXT,
    "object_repr" VARCHAR(200) NOT NULL,
    "action_flag" SMALLINT NOT NULL,
    "change_message" TEXT NOT NULL,
    "content_type_id" INTEGER,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "django_admin_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_content_type" (
    "id" SERIAL NOT NULL,
    "app_label" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,

    CONSTRAINT "django_content_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_migrations" (
    "id" BIGSERIAL NOT NULL,
    "app" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "applied" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "django_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "django_session" (
    "session_key" VARCHAR(40) NOT NULL,
    "session_data" TEXT NOT NULL,
    "expire_date" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "django_session_pkey" PRIMARY KEY ("session_key")
);

-- CreateTable
CREATE TABLE "todo_task" (
    "id" BIGSERIAL NOT NULL,
    "task_name" VARCHAR(200) NOT NULL,
    "due_date" DATE NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "completed_at" TIMESTAMPTZ(6) NOT NULL,
    "company_id" BIGINT,
    "contact_id" BIGINT,

    CONSTRAINT "todo_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_assetaccountsreceivable" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "book_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "contact_id" BIGINT,
    "currency_id" BIGINT NOT NULL,
    "invoice_id" BIGINT,

    CONSTRAINT "accounting_assetaccountsreceivable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_assetcash" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency_balance" DECIMAL(10,2),
    "book_id" BIGINT NOT NULL,
    "currency_id" BIGINT NOT NULL,
    "transaction_id" BIGINT,

    CONSTRAINT "accounting_assetcash_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_assetinventorygood" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "modified_at" DATE,
    "name" VARCHAR(300) NOT NULL,
    "unit_cost" DECIMAL(10,2) NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "stock_type" VARCHAR,
    "status" VARCHAR NOT NULL,
    "warehouse" VARCHAR,
    "location" VARCHAR,
    "book_id" BIGINT NOT NULL,
    "currency_id" BIGINT NOT NULL,

    CONSTRAINT "accounting_assetinventorygood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_assetinventoryrawmaterial" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "name" VARCHAR NOT NULL,
    "stock_id" VARCHAR,
    "receipt_number" VARCHAR,
    "unit_of_measurement" VARCHAR,
    "unit_cost" DECIMAL(10,2) NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "warehouse" VARCHAR,
    "location" VARCHAR,
    "raw_type" VARCHAR NOT NULL,
    "book_id" BIGINT NOT NULL,
    "currency_id" BIGINT NOT NULL,
    "supplier_id" BIGINT,

    CONSTRAINT "accounting_assetinventoryrawmaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_book" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "total_shares" INTEGER NOT NULL,

    CONSTRAINT "accounting_book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_cashaccount" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL,
    "book_id" BIGINT NOT NULL,
    "currency_id" BIGINT NOT NULL,

    CONSTRAINT "accounting_cashaccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_currencycategory" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(3) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "symbol" VARCHAR(5),

    CONSTRAINT "accounting_currencycategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_equitycapital" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "date_invested" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "new_shares_issued" INTEGER NOT NULL,
    "note" TEXT,
    "book_id" BIGINT NOT NULL,
    "cash_account_id" BIGINT NOT NULL,
    "currency_id" BIGINT,
    "member_id" BIGINT NOT NULL,

    CONSTRAINT "accounting_equitycapital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_equitydivident" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "book_id" BIGINT NOT NULL,
    "cash_account_id" BIGINT NOT NULL,
    "currency_id" BIGINT,
    "member_id" BIGINT,

    CONSTRAINT "accounting_equitydivident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_equityexpense" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "book_id" BIGINT NOT NULL,
    "cash_account_id" BIGINT NOT NULL,
    "category_id" BIGINT,
    "currency_id" BIGINT NOT NULL,

    CONSTRAINT "accounting_equityexpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_equityrevenue" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "invoice_number" VARCHAR(20),
    "revenue_type" VARCHAR NOT NULL,
    "book_id" BIGINT NOT NULL,
    "cash_account_id" BIGINT NOT NULL,
    "currency_id" BIGINT,

    CONSTRAINT "accounting_equityrevenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_expensecategory" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "accounting_expensecategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_intransfer" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" DATE,
    "description" VARCHAR(200),
    "book_id" BIGINT NOT NULL,
    "currency_id" BIGINT NOT NULL,
    "destination_id" BIGINT NOT NULL,
    "source_id" BIGINT NOT NULL,

    CONSTRAINT "accounting_intransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_invoice" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "due_cate" TIMESTAMPTZ(6) NOT NULL,
    "items" JSONB NOT NULL,
    "invoice_type" VARCHAR NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "paid" DECIMAL(10,2) NOT NULL,
    "book_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "contact_id" BIGINT,

    CONSTRAINT "accounting_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_liabilityaccountspayable" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "receipt" VARCHAR,
    "book_id" BIGINT NOT NULL,
    "currency_id" BIGINT NOT NULL,
    "supplier_id" BIGINT,

    CONSTRAINT "accounting_liabilityaccountspayable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_metric" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "money_in" DECIMAL(12,2) NOT NULL,
    "money_out" DECIMAL(12,2) NOT NULL,
    "burn" DECIMAL(12,2) NOT NULL,
    "inventory" DECIMAL(12,2) NOT NULL,
    "accounts_receivable" DECIMAL(12,2) NOT NULL,
    "accounts_payable" DECIMAL(12,2) NOT NULL,
    "runway" DECIMAL(12,1) NOT NULL,
    "growth_rate" DECIMAL(12,1) NOT NULL,
    "default_alive" BOOLEAN NOT NULL,
    "book_id" BIGINT,

    CONSTRAINT "accounting_metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_stakeholderbook" (
    "id" BIGSERIAL NOT NULL,
    "shares" INTEGER NOT NULL,
    "book_id" BIGINT NOT NULL,
    "member_id" BIGINT,

    CONSTRAINT "accounting_stakeholderbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_transaction" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "type" VARCHAR(50),
    "type_pk" INTEGER,
    "account_balance" DECIMAL(12,2),
    "account_id" BIGINT,
    "book_id" BIGINT NOT NULL,
    "currency_id" BIGINT NOT NULL,

    CONSTRAINT "accounting_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authentication_member_permissions" (
    "id" BIGSERIAL NOT NULL,
    "member_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,

    CONSTRAINT "authentication_member_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authentication_permission" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "authentication_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_supplier" (
    "id" BIGSERIAL NOT NULL,
    "company_name" VARCHAR(300),
    "contact_name" VARCHAR(300),
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "website" VARCHAR(200) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "crm_supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_product" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "sku" VARCHAR(12),
    "barcode" VARCHAR(14),
    "tags" VARCHAR(100)[],
    "type" VARCHAR,
    "unit_of_measurement" VARCHAR,
    "quantity" DECIMAL(10,2),
    "price" DECIMAL(10,2),
    "featured" BOOLEAN,
    "selling_while_out_of_stock" BOOLEAN,
    "weight" DECIMAL(10,2),
    "unit_of_weight" VARCHAR,
    "category_id" BIGINT,
    "supplier_id" BIGINT,
    "has_variants" BOOLEAN NOT NULL,
    "datasheet_url" VARCHAR(200),
    "minimum_inventory_level" DECIMAL(10,2),

    CONSTRAINT "marketing_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_product_collections" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "productcollection_id" BIGINT NOT NULL,

    CONSTRAINT "marketing_product_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_productfile" (
    "id" BIGSERIAL NOT NULL,
    "file" VARCHAR(100) NOT NULL,
    "product_id" BIGINT,
    "product_variant_id" BIGINT,

    CONSTRAINT "marketing_productfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_productvariant" (
    "id" BIGSERIAL NOT NULL,
    "variant_sku" VARCHAR(12),
    "variant_barcode" VARCHAR(14),
    "variant_quantity" DECIMAL(10,2),
    "variant_price" DECIMAL(10,2),
    "variant_cost" DECIMAL(10,2),
    "variant_featured" BOOLEAN NOT NULL,
    "product_id" BIGINT,
    "variant_datasheet_url" VARCHAR(200),
    "variant_minimum_inventory_level" DECIMAL(10,2),

    CONSTRAINT "marketing_productvariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_productvariantattribute" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "marketing_productvariantattribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_productvariantattributevalue" (
    "id" BIGSERIAL NOT NULL,
    "product_variant_attribute_value" VARCHAR(255) NOT NULL,
    "product_variant_attribute_id" BIGINT NOT NULL,
    "product_variant_id" BIGINT,
    "product_id" BIGINT,

    CONSTRAINT "marketing_productvariantattributevalue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operating_machine" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "max_rpm" INTEGER NOT NULL,
    "domain" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "operating_machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_currencyexchange" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "from_amount" DECIMAL(10,2) NOT NULL,
    "to_amount" DECIMAL(10,2) NOT NULL,
    "date" DATE,
    "book_id" BIGINT NOT NULL,
    "from_cash_account_id" BIGINT NOT NULL,
    "to_cash_account_id" BIGINT NOT NULL,

    CONSTRAINT "accounting_currencyexchange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_productcategory" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "name" VARCHAR(255),

    CONSTRAINT "marketing_productcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_productcollection" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "image" VARCHAR(100),

    CONSTRAINT "marketing_productcollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_group_name_key" ON "auth_group"("name");

-- CreateIndex
CREATE INDEX "auth_group_name_a6ea08ec_like" ON "auth_group"("name");

-- CreateIndex
CREATE INDEX "auth_group_permissions_group_id_b120cbf9" ON "auth_group_permissions"("group_id");

-- CreateIndex
CREATE INDEX "auth_group_permissions_permission_id_84c5c92e" ON "auth_group_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_group_permissions_group_id_permission_id_0cd325b0_uniq" ON "auth_group_permissions"("group_id", "permission_id");

-- CreateIndex
CREATE INDEX "auth_permission_content_type_id_2f476e4b" ON "auth_permission"("content_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_permission_content_type_id_codename_01ab375a_uniq" ON "auth_permission"("content_type_id", "codename");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_username_key" ON "auth_user"("username");

-- CreateIndex
CREATE INDEX "auth_user_username_6821ab7c_like" ON "auth_user"("username");

-- CreateIndex
CREATE INDEX "auth_user_groups_group_id_97559544" ON "auth_user_groups"("group_id");

-- CreateIndex
CREATE INDEX "auth_user_groups_user_id_6a12ed8b" ON "auth_user_groups"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_groups_user_id_group_id_94350c0c_uniq" ON "auth_user_groups"("user_id", "group_id");

-- CreateIndex
CREATE INDEX "auth_user_user_permissions_permission_id_1fbb5f2c" ON "auth_user_user_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "auth_user_user_permissions_user_id_a95ead1b" ON "auth_user_user_permissions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_user_permissions_user_id_permission_id_14a6b632_uniq" ON "auth_user_user_permissions"("user_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "authentication_member_user_id_key" ON "authentication_member"("user_id");

-- CreateIndex
CREATE INDEX "crm_contact_company_id_5104bcf2" ON "crm_contact"("company_id");

-- CreateIndex
CREATE INDEX "crm_note_company_id_9ceedb83" ON "crm_note"("company_id");

-- CreateIndex
CREATE INDEX "crm_note_contact_id_8d258ea9" ON "crm_note"("contact_id");

-- CreateIndex
CREATE INDEX "django_admin_log_content_type_id_c4bce8eb" ON "django_admin_log"("content_type_id");

-- CreateIndex
CREATE INDEX "django_admin_log_user_id_c564eba6" ON "django_admin_log"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "django_content_type_app_label_model_76bd3d3b_uniq" ON "django_content_type"("app_label", "model");

-- CreateIndex
CREATE INDEX "django_session_expire_date_a5c62663" ON "django_session"("expire_date");

-- CreateIndex
CREATE INDEX "django_session_session_key_c0390e0f_like" ON "django_session"("session_key");

-- CreateIndex
CREATE INDEX "todo_task_company_id_fed9e4bc" ON "todo_task"("company_id");

-- CreateIndex
CREATE INDEX "todo_task_contact_id_4691b54e" ON "todo_task"("contact_id");

-- CreateIndex
CREATE INDEX "accounting_assetaccountsreceivable_book_id_9b813c34" ON "accounting_assetaccountsreceivable"("book_id");

-- CreateIndex
CREATE INDEX "accounting_assetaccountsreceivable_company_id_17a2d71d" ON "accounting_assetaccountsreceivable"("company_id");

-- CreateIndex
CREATE INDEX "accounting_assetaccountsreceivable_contact_id_1f96866a" ON "accounting_assetaccountsreceivable"("contact_id");

-- CreateIndex
CREATE INDEX "accounting_assetaccountsreceivable_currency_id_3d6903f3" ON "accounting_assetaccountsreceivable"("currency_id");

-- CreateIndex
CREATE INDEX "accounting_assetaccountsreceivable_invoice_id_f7473197" ON "accounting_assetaccountsreceivable"("invoice_id");

-- CreateIndex
CREATE INDEX "accounting_assetcash_book_id_c4df870a" ON "accounting_assetcash"("book_id");

-- CreateIndex
CREATE INDEX "accounting_assetcash_currency_id_0b544ce7" ON "accounting_assetcash"("currency_id");

-- CreateIndex
CREATE INDEX "accounting_assetcash_transaction_id_b8c3e7c9" ON "accounting_assetcash"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_assetinventorygood_name_key" ON "accounting_assetinventorygood"("name");

-- CreateIndex
CREATE INDEX "accounting_assetinventorygood_book_id_4d578031" ON "accounting_assetinventorygood"("book_id");

-- CreateIndex
CREATE INDEX "accounting_assetinventorygood_currency_id_d6290f64" ON "accounting_assetinventorygood"("currency_id");

-- CreateIndex
CREATE INDEX "accounting_assetinventorygood_name_fb1611c3_like" ON "accounting_assetinventorygood"("name");

-- CreateIndex
CREATE INDEX "accounting_assetinventoryrawmaterial_book_id_687d7f7c" ON "accounting_assetinventoryrawmaterial"("book_id");

-- CreateIndex
CREATE INDEX "accounting_assetinventoryrawmaterial_currency_id_ae5f5615" ON "accounting_assetinventoryrawmaterial"("currency_id");

-- CreateIndex
CREATE INDEX "accounting_assetinventoryrawmaterial_supplier_id_859b8417" ON "accounting_assetinventoryrawmaterial"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_name_supplier" ON "accounting_assetinventoryrawmaterial"("name", "supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_book_name_key" ON "accounting_book"("name");

-- CreateIndex
CREATE INDEX "accounting_book_name_6eb9bad9_like" ON "accounting_book"("name");

-- CreateIndex
CREATE INDEX "accounting_cashaccount_book_id_90f88e20" ON "accounting_cashaccount"("book_id");

-- CreateIndex
CREATE INDEX "accounting_cashaccount_currency_id_807cd656" ON "accounting_cashaccount"("currency_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_book_cashaccount" ON "accounting_cashaccount"("book_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_currencycategory_code_key" ON "accounting_currencycategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_currencycategory_name_key" ON "accounting_currencycategory"("name");

-- CreateIndex
CREATE INDEX "accounting_currencycategory_code_afbf6634_like" ON "accounting_currencycategory"("code");

-- CreateIndex
CREATE INDEX "accounting_currencycategory_name_62f10b06_like" ON "accounting_currencycategory"("name");

-- CreateIndex
CREATE INDEX "accounting_equitycapital_book_id_3bb7b1c9" ON "accounting_equitycapital"("book_id");

-- CreateIndex
CREATE INDEX "accounting_equitycapital_cash_account_id_b51b8a10" ON "accounting_equitycapital"("cash_account_id");

-- CreateIndex
CREATE INDEX "accounting_equitycapital_currency_id_fbe16291" ON "accounting_equitycapital"("currency_id");

-- CreateIndex
CREATE INDEX "accounting_equitycapital_member_id_3a31aa46" ON "accounting_equitycapital"("member_id");

-- CreateIndex
CREATE INDEX "accounting_equitydivident_book_id_4784d867" ON "accounting_equitydivident"("book_id");

-- CreateIndex
CREATE INDEX "accounting_equitydivident_cash_account_id_2006fe5d" ON "accounting_equitydivident"("cash_account_id");

-- CreateIndex
CREATE INDEX "accounting_equitydivident_currency_id_22acf853" ON "accounting_equitydivident"("currency_id");

-- CreateIndex
CREATE INDEX "accounting_equitydivident_member_id_160e5dde" ON "accounting_equitydivident"("member_id");

-- CreateIndex
CREATE INDEX "accounting_equityexpense_cash_account_id_bbe4c920" ON "accounting_equityexpense"("cash_account_id");

-- CreateIndex
CREATE INDEX "accounting_equityexpense_book_id_7c69774e" ON "accounting_equityexpense"("book_id");

-- CreateIndex
CREATE INDEX "accounting_equityexpense_category_id_fedd0995" ON "accounting_equityexpense"("category_id");

-- CreateIndex
CREATE INDEX "accounting_equityexpense_currency_id_2e603d51" ON "accounting_equityexpense"("currency_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_equityrevenue_invoice_number_key" ON "accounting_equityrevenue"("invoice_number");

-- CreateIndex
CREATE INDEX "accounting_equityrevenue_book_id_784ed443" ON "accounting_equityrevenue"("book_id");

-- CreateIndex
CREATE INDEX "accounting_equityrevenue_cash_account_id_2fb5d4af" ON "accounting_equityrevenue"("cash_account_id");

-- CreateIndex
CREATE INDEX "accounting_equityrevenue_currency_id_52d19808" ON "accounting_equityrevenue"("currency_id");

-- CreateIndex
CREATE INDEX "accounting_equityrevenue_invoice_number_2ddec667_like" ON "accounting_equityrevenue"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_expensecategory_name_key" ON "accounting_expensecategory"("name");

-- CreateIndex
CREATE INDEX "accounting_expensecategory_name_cb9859d6_like" ON "accounting_expensecategory"("name");

-- CreateIndex
CREATE INDEX "accounting_intransfer_book_id_e5b465c2" ON "accounting_intransfer"("book_id");

-- CreateIndex
CREATE INDEX "accounting_intransfer_currency_id_fda2e854" ON "accounting_intransfer"("currency_id");

-- CreateIndex
CREATE INDEX "accounting_intransfer_destination_id_c6bc6280" ON "accounting_intransfer"("destination_id");

-- CreateIndex
CREATE INDEX "accounting_intransfer_source_id_1faa0353" ON "accounting_intransfer"("source_id");

-- CreateIndex
CREATE INDEX "accounting_invoice_book_id_3df06427" ON "accounting_invoice"("book_id");

-- CreateIndex
CREATE INDEX "accounting_invoice_company_id_38eec83f" ON "accounting_invoice"("company_id");

-- CreateIndex
CREATE INDEX "accounting_invoice_contact_id_b3fed0ee" ON "accounting_invoice"("contact_id");

-- CreateIndex
CREATE INDEX "accounting_liabilityaccountspayable_book_id_333eeb14" ON "accounting_liabilityaccountspayable"("book_id");

-- CreateIndex
CREATE INDEX "accounting_liabilityaccountspayable_currency_id_c8287afc" ON "accounting_liabilityaccountspayable"("currency_id");

-- CreateIndex
CREATE INDEX "accounting_liabilityaccountspayable_supplier_id_07c161e0" ON "accounting_liabilityaccountspayable"("supplier_id");

-- CreateIndex
CREATE INDEX "accounting_metric_book_id_2ff86ad8" ON "accounting_metric"("book_id");

-- CreateIndex
CREATE INDEX "accounting_stakeholderbook_book_id_1ba92948" ON "accounting_stakeholderbook"("book_id");

-- CreateIndex
CREATE INDEX "accounting_stakeholderbook_member_id_31ff9801" ON "accounting_stakeholderbook"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_stakeholderbook_member_id_book_id_9e19b25e_uniq" ON "accounting_stakeholderbook"("member_id", "book_id");

-- CreateIndex
CREATE INDEX "accounting_transaction_account_id_cd2bdf36" ON "accounting_transaction"("account_id");

-- CreateIndex
CREATE INDEX "accounting_transaction_book_id_ef611a98" ON "accounting_transaction"("book_id");

-- CreateIndex
CREATE INDEX "accounting_transaction_currency_id_73d486f9" ON "accounting_transaction"("currency_id");

-- CreateIndex
CREATE INDEX "authentication_member_permissions_member_id_25ee1da1" ON "authentication_member_permissions"("member_id");

-- CreateIndex
CREATE INDEX "authentication_member_permissions_permission_id_18e23581" ON "authentication_member_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "authentication_member_pe_member_id_permission_id_9c83b1c2_uniq" ON "authentication_member_permissions"("member_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "authentication_permission_name_key" ON "authentication_permission"("name");

-- CreateIndex
CREATE INDEX "authentication_permission_name_7b07510c_like" ON "authentication_permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_product_sku_4e12cb16_uniq" ON "marketing_product"("sku");

-- CreateIndex
CREATE INDEX "marketing_product_category_id_c776e438" ON "marketing_product"("category_id");

-- CreateIndex
CREATE INDEX "marketing_product_supplier_id_c9957948" ON "marketing_product"("supplier_id");

-- CreateIndex
CREATE INDEX "marketing_product_barcode_1e6ca3df" ON "marketing_product"("barcode");

-- CreateIndex
CREATE INDEX "marketing_product_barcode_1e6ca3df_like" ON "marketing_product"("barcode");

-- CreateIndex
CREATE INDEX "marketing_product_featured_6995ee9a" ON "marketing_product"("featured");

-- CreateIndex
CREATE INDEX "marketing_product_sku_4e12cb16_like" ON "marketing_product"("sku");

-- CreateIndex
CREATE INDEX "marketing_product_collections_product_id_ab29b623" ON "marketing_product_collections"("product_id");

-- CreateIndex
CREATE INDEX "marketing_product_collections_productcollection_id_2189399f" ON "marketing_product_collections"("productcollection_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_product_collec_product_id_productcollec_e8ddc69b_uniq" ON "marketing_product_collections"("product_id", "productcollection_id");

-- CreateIndex
CREATE INDEX "marketing_productfile_product_id_68c8359c" ON "marketing_productfile"("product_id");

-- CreateIndex
CREATE INDEX "marketing_productfile_product_variant_id_74a0d958" ON "marketing_productfile"("product_variant_id");

-- CreateIndex
CREATE INDEX "marketing_productvariant_product_id_d830f278" ON "marketing_productvariant"("product_id");

-- CreateIndex
CREATE INDEX "marketing_productvariant_variant_barcode_dad1695f" ON "marketing_productvariant"("variant_barcode");

-- CreateIndex
CREATE INDEX "marketing_productvariant_variant_barcode_dad1695f_like" ON "marketing_productvariant"("variant_barcode");

-- CreateIndex
CREATE INDEX "marketing_productvariant_variant_sku_4961a567" ON "marketing_productvariant"("variant_sku");

-- CreateIndex
CREATE INDEX "marketing_productvariant_variant_sku_4961a567_like" ON "marketing_productvariant"("variant_sku");

-- CreateIndex
CREATE INDEX "marketing_productvariantattributevalue_attribute_id_2b0d83d5" ON "marketing_productvariantattributevalue"("product_variant_attribute_id");

-- CreateIndex
CREATE INDEX "marketing_productvariantattributevalue_variant_id_4d257d6d" ON "marketing_productvariantattributevalue"("product_variant_id");

-- CreateIndex
CREATE INDEX "marketing_productvariantattributevalue_product_id_65518724" ON "marketing_productvariantattributevalue"("product_id");

-- CreateIndex
CREATE INDEX "marketing_productvariantattributevalue_value_17ca7ef7" ON "marketing_productvariantattributevalue"("product_variant_attribute_value");

-- CreateIndex
CREATE INDEX "marketing_productvariantattributevalue_value_17ca7ef7_like" ON "marketing_productvariantattributevalue"("product_variant_attribute_value");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_productvariant_variant_id_attribute_id_253d4de3_uniq" ON "marketing_productvariantattributevalue"("product_variant_id", "product_variant_attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "operating_machine_name_key" ON "operating_machine"("name");

-- CreateIndex
CREATE INDEX "operating_machine_name_eb93fe62_like" ON "operating_machine"("name");

-- CreateIndex
CREATE INDEX "accounting_currencyexchange_book_id_3626bd75" ON "accounting_currencyexchange"("book_id");

-- CreateIndex
CREATE INDEX "accounting_currencyexchange_from_cash_account_id_4e5f1e9c" ON "accounting_currencyexchange"("from_cash_account_id");

-- CreateIndex
CREATE INDEX "accounting_currencyexchange_to_cash_account_id_25a856c2" ON "accounting_currencyexchange"("to_cash_account_id");

-- AddForeignKey
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissio_permission_id_84c5c92e_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "auth_permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_group_id_b120cbf9_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "auth_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_permission" ADD CONSTRAINT "auth_permission_content_type_id_2f476e4b_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_user_groups" ADD CONSTRAINT "auth_user_groups_group_id_97559544_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "auth_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_user_groups" ADD CONSTRAINT "auth_user_groups_user_id_6a12ed8b_fk_auth_user_id" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_user_user_permissions" ADD CONSTRAINT "auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "auth_permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_user_user_permissions" ADD CONSTRAINT "auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "authentication_member" ADD CONSTRAINT "authentication_member_user_id_af273d22_fk_auth_user_id" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "crm_contact" ADD CONSTRAINT "crm_contact_company_id_5104bcf2_fk_crm_company_id" FOREIGN KEY ("company_id") REFERENCES "crm_company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "crm_note" ADD CONSTRAINT "crm_note_company_id_9ceedb83_fk_crm_company_id" FOREIGN KEY ("company_id") REFERENCES "crm_company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "crm_note" ADD CONSTRAINT "crm_note_contact_id_8d258ea9_fk_crm_contact_id" FOREIGN KEY ("contact_id") REFERENCES "crm_contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_content_type_id_c4bce8eb_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_user_id_c564eba6_fk_auth_user_id" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "todo_task" ADD CONSTRAINT "todo_task_company_id_fed9e4bc_fk_crm_company_id" FOREIGN KEY ("company_id") REFERENCES "crm_company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "todo_task" ADD CONSTRAINT "todo_task_contact_id_4691b54e_fk_crm_contact_id" FOREIGN KEY ("contact_id") REFERENCES "crm_contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_assetaccountsreceivable" ADD CONSTRAINT "accounting_assetacco_book_id_9b813c34_fk_accountin" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_assetaccountsreceivable" ADD CONSTRAINT "accounting_assetacco_company_id_17a2d71d_fk_crm_compa" FOREIGN KEY ("company_id") REFERENCES "crm_company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_assetaccountsreceivable" ADD CONSTRAINT "accounting_assetacco_contact_id_1f96866a_fk_crm_conta" FOREIGN KEY ("contact_id") REFERENCES "crm_contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_assetaccountsreceivable" ADD CONSTRAINT "accounting_assetacco_currency_id_3d6903f3_fk_accountin" FOREIGN KEY ("currency_id") REFERENCES "accounting_currencycategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_assetaccountsreceivable" ADD CONSTRAINT "accounting_assetacco_invoice_id_f7473197_fk_accountin" FOREIGN KEY ("invoice_id") REFERENCES "accounting_invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_assetcash" ADD CONSTRAINT "accounting_assetcash_book_id_c4df870a_fk_accounting_book_id" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_assetcash" ADD CONSTRAINT "accounting_assetcash_currency_id_0b544ce7_fk_accountin" FOREIGN KEY ("currency_id") REFERENCES "accounting_currencycategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_assetcash" ADD CONSTRAINT "accounting_assetcash_transaction_id_b8c3e7c9_fk_accountin" FOREIGN KEY ("transaction_id") REFERENCES "accounting_transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_assetinventorygood" ADD CONSTRAINT "accounting_assetinve_book_id_4d578031_fk_accountin" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_assetinventorygood" ADD CONSTRAINT "accounting_assetinve_currency_id_d6290f64_fk_accountin" FOREIGN KEY ("currency_id") REFERENCES "accounting_currencycategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_assetinventoryrawmaterial" ADD CONSTRAINT "accounting_assetinve_book_id_687d7f7c_fk_accountin" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_assetinventoryrawmaterial" ADD CONSTRAINT "accounting_assetinve_currency_id_ae5f5615_fk_accountin" FOREIGN KEY ("currency_id") REFERENCES "accounting_currencycategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_assetinventoryrawmaterial" ADD CONSTRAINT "accounting_assetinve_supplier_id_859b8417_fk_crm_suppl" FOREIGN KEY ("supplier_id") REFERENCES "crm_supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_cashaccount" ADD CONSTRAINT "accounting_cashaccount_book_id_90f88e20_fk_accounting_book_id" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_cashaccount" ADD CONSTRAINT "accounting_cashcateg_currency_id_ed9ccd42_fk_accountin" FOREIGN KEY ("currency_id") REFERENCES "accounting_currencycategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equitycapital" ADD CONSTRAINT "accounting_equitycap_cash_account_id_b51b8a10_fk_accountin" FOREIGN KEY ("cash_account_id") REFERENCES "accounting_cashaccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equitycapital" ADD CONSTRAINT "accounting_equitycap_currency_id_fbe16291_fk_accountin" FOREIGN KEY ("currency_id") REFERENCES "accounting_currencycategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equitycapital" ADD CONSTRAINT "accounting_equitycap_member_id_3a31aa46_fk_authentic" FOREIGN KEY ("member_id") REFERENCES "authentication_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equitycapital" ADD CONSTRAINT "accounting_equitycapital_book_id_3bb7b1c9_fk_accounting_book_id" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equitydivident" ADD CONSTRAINT "accounting_equitydiv_book_id_4784d867_fk_accountin" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equitydivident" ADD CONSTRAINT "accounting_equitydiv_cash_account_id_2006fe5d_fk_accountin" FOREIGN KEY ("cash_account_id") REFERENCES "accounting_cashaccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equitydivident" ADD CONSTRAINT "accounting_equitydiv_currency_id_22acf853_fk_accountin" FOREIGN KEY ("currency_id") REFERENCES "accounting_currencycategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equitydivident" ADD CONSTRAINT "accounting_equitydiv_member_id_160e5dde_fk_authentic" FOREIGN KEY ("member_id") REFERENCES "authentication_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equityexpense" ADD CONSTRAINT "accounting_equityexp_cash_account_id_bbe4c920_fk_accountin" FOREIGN KEY ("cash_account_id") REFERENCES "accounting_cashaccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equityexpense" ADD CONSTRAINT "accounting_equityexp_currency_id_2e603d51_fk_accountin" FOREIGN KEY ("currency_id") REFERENCES "accounting_currencycategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equityexpense" ADD CONSTRAINT "accounting_expense_book_id_7cf396e0_fk_accounting_book_id" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equityexpense" ADD CONSTRAINT "accounting_expense_category_id_4c3c6039_fk_accountin" FOREIGN KEY ("category_id") REFERENCES "accounting_expensecategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equityrevenue" ADD CONSTRAINT "accounting_equityrev_cash_account_id_2fb5d4af_fk_accountin" FOREIGN KEY ("cash_account_id") REFERENCES "accounting_cashaccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equityrevenue" ADD CONSTRAINT "accounting_equityrev_currency_id_52d19808_fk_accountin" FOREIGN KEY ("currency_id") REFERENCES "accounting_currencycategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_equityrevenue" ADD CONSTRAINT "accounting_equityrevenue_book_id_784ed443_fk_accounting_book_id" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_intransfer" ADD CONSTRAINT "accounting_intransfe_currency_id_fda2e854_fk_accountin" FOREIGN KEY ("currency_id") REFERENCES "accounting_currencycategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_intransfer" ADD CONSTRAINT "accounting_intransfe_destination_id_c6bc6280_fk_accountin" FOREIGN KEY ("destination_id") REFERENCES "accounting_cashaccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_intransfer" ADD CONSTRAINT "accounting_intransfe_source_id_1faa0353_fk_accountin" FOREIGN KEY ("source_id") REFERENCES "accounting_cashaccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_intransfer" ADD CONSTRAINT "accounting_intransfer_book_id_e5b465c2_fk_accounting_book_id" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_invoice" ADD CONSTRAINT "accounting_invoice_book_id_3df06427_fk_accounting_book_id" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_invoice" ADD CONSTRAINT "accounting_invoice_company_id_38eec83f_fk_crm_company_id" FOREIGN KEY ("company_id") REFERENCES "crm_company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_invoice" ADD CONSTRAINT "accounting_invoice_contact_id_b3fed0ee_fk_crm_contact_id" FOREIGN KEY ("contact_id") REFERENCES "crm_contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_liabilityaccountspayable" ADD CONSTRAINT "accounting_assetacco_book_id_5c5fc572_fk_accountin" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_liabilityaccountspayable" ADD CONSTRAINT "accounting_assetacco_currency_id_14f235b1_fk_accountin" FOREIGN KEY ("currency_id") REFERENCES "accounting_currencycategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_liabilityaccountspayable" ADD CONSTRAINT "accounting_assetacco_supplier_id_4b8ecab4_fk_crm_suppl" FOREIGN KEY ("supplier_id") REFERENCES "crm_supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_metric" ADD CONSTRAINT "accounting_metric_book_id_2ff86ad8_fk_accounting_book_id" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_stakeholderbook" ADD CONSTRAINT "accounting_stakehold_book_id_1ba92948_fk_accountin" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_stakeholderbook" ADD CONSTRAINT "accounting_stakehold_member_id_31ff9801_fk_authentic" FOREIGN KEY ("member_id") REFERENCES "authentication_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_transaction" ADD CONSTRAINT "accounting_transacti_account_id_cd2bdf36_fk_accountin" FOREIGN KEY ("account_id") REFERENCES "accounting_cashaccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_transaction" ADD CONSTRAINT "accounting_transacti_currency_id_73d486f9_fk_accountin" FOREIGN KEY ("currency_id") REFERENCES "accounting_currencycategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_transaction" ADD CONSTRAINT "accounting_transaction_book_id_ef611a98_fk_accounting_book_id" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "authentication_member_permissions" ADD CONSTRAINT "authentication_membe_member_id_04e54cd1_fk_authentic" FOREIGN KEY ("member_id") REFERENCES "authentication_member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "authentication_member_permissions" ADD CONSTRAINT "authentication_membe_permission_id_77771c1a_fk_authentic" FOREIGN KEY ("permission_id") REFERENCES "authentication_permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketing_product" ADD CONSTRAINT "marketing_product_category_id_c776e438_fk_marketing" FOREIGN KEY ("category_id") REFERENCES "marketing_productcategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketing_product" ADD CONSTRAINT "marketing_product_supplier_id_c9957948_fk_crm_supplier_id" FOREIGN KEY ("supplier_id") REFERENCES "crm_supplier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketing_product_collections" ADD CONSTRAINT "marketing_product_co_product_id_ab29b623_fk_marketing" FOREIGN KEY ("product_id") REFERENCES "marketing_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketing_product_collections" ADD CONSTRAINT "marketing_product_co_productcollection_id_2189399f_fk_marketing" FOREIGN KEY ("productcollection_id") REFERENCES "marketing_productcollection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketing_productfile" ADD CONSTRAINT "marketing_productfil_product_id_68c8359c_fk_marketing" FOREIGN KEY ("product_id") REFERENCES "marketing_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketing_productfile" ADD CONSTRAINT "marketing_productfil_product_variant_id_74a0d958_fk_marketing" FOREIGN KEY ("product_variant_id") REFERENCES "marketing_productvariant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketing_productvariant" ADD CONSTRAINT "marketing_productvar_product_id_d830f278_fk_marketing" FOREIGN KEY ("product_id") REFERENCES "marketing_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketing_productvariantattributevalue" ADD CONSTRAINT "marketing_productvar_product_id_65518724_fk_marketing" FOREIGN KEY ("product_id") REFERENCES "marketing_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketing_productvariantattributevalue" ADD CONSTRAINT "marketing_productvar_product_variant_attr_4836c067_fk_marketing" FOREIGN KEY ("product_variant_attribute_id") REFERENCES "marketing_productvariantattribute"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "marketing_productvariantattributevalue" ADD CONSTRAINT "marketing_productvar_product_variant_id_13dc74f2_fk_marketing" FOREIGN KEY ("product_variant_id") REFERENCES "marketing_productvariant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_currencyexchange" ADD CONSTRAINT "accounting_currencye_book_id_3626bd75_fk_accountin" FOREIGN KEY ("book_id") REFERENCES "accounting_book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_currencyexchange" ADD CONSTRAINT "accounting_currencye_from_cash_account_id_4e5f1e9c_fk_accountin" FOREIGN KEY ("from_cash_account_id") REFERENCES "accounting_cashaccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_currencyexchange" ADD CONSTRAINT "accounting_currencye_to_cash_account_id_25a856c2_fk_accountin" FOREIGN KEY ("to_cash_account_id") REFERENCES "accounting_cashaccount"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

