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
    "company_name" VARCHAR(100) NOT NULL,
    "user_id" INTEGER,

    CONSTRAINT "authentication_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_company" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "zip_code" VARCHAR(10) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "website" VARCHAR(200) NOT NULL,

    CONSTRAINT "crm_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_contact" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "birthday" DATE,
    "city" VARCHAR(100) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "job_title" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "zip_code" VARCHAR(10) NOT NULL,
    "company_id" BIGINT,

    CONSTRAINT "crm_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_note" (
    "id" BIGSERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "contact_id" BIGINT,
    "company_id" BIGINT,
    "modified_date" TIMESTAMPTZ(6) NOT NULL,

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
    "description" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "completed_at" TIMESTAMPTZ(6) NOT NULL,
    "company_id" BIGINT,
    "contact_id" BIGINT,
    "days_since_due" INTEGER NOT NULL,

    CONSTRAINT "todo_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

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

