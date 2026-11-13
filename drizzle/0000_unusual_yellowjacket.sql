CREATE TABLE "ai_knowledge" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"content" text NOT NULL,
	"file_name" text,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"session_id" text PRIMARY KEY NOT NULL,
	"guest_name" text DEFAULT 'Gość Watra' NOT NULL,
	"guest_email" text,
	"language" text DEFAULT 'pl' NOT NULL,
	"is_ai_paused" boolean DEFAULT false NOT NULL,
	"admin_takeover" boolean DEFAULT false NOT NULL,
	"last_message" text,
	"last_message_at" timestamp DEFAULT now(),
	"messages_json" text DEFAULT '[]' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cms_content" (
	"id" text PRIMARY KEY NOT NULL,
	"content" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"discount_percentage" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"termination_type" text DEFAULT 'time' NOT NULL,
	"start_date" text,
	"end_date" text,
	"usage_limit" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"available_in_chat" boolean DEFAULT true NOT NULL,
	"chat_trigger_note" text DEFAULT '' NOT NULL,
	"min_booking_nights" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "guest_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"guest_email" text NOT NULL,
	"sender" text DEFAULT 'admin' NOT NULL,
	"sender_name" text DEFAULT 'Recepcja Watra' NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'chat' NOT NULL,
	"promo_discount" integer,
	"promo_code" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guest_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"badges" text DEFAULT '[]' NOT NULL,
	"loyalty_tier" text DEFAULT 'bronze' NOT NULL,
	"notes" text,
	"total_visits" integer DEFAULT 1 NOT NULL,
	"total_spend" integer DEFAULT 0 NOT NULL,
	"last_visit" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"name" text PRIMARY KEY NOT NULL,
	"original_name" text NOT NULL,
	"content_type" text NOT NULL,
	"data" "bytea" NOT NULL,
	"size" integer NOT NULL,
	"uploaded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"badge" text NOT NULL,
	"description" text NOT NULL,
	"discount_percent" integer NOT NULL,
	"promo_code" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"channels" text DEFAULT '["website"]' NOT NULL,
	"starts_at" text NOT NULL,
	"ends_at" text NOT NULL,
	"clicks_count" integer DEFAULT 0 NOT NULL,
	"bookings_count" integer DEFAULT 0 NOT NULL,
	"revenue_generated" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"guest_name" text NOT NULL,
	"guest_email" text NOT NULL,
	"guest_phone" text NOT NULL,
	"room_id" text NOT NULL,
	"check_in" text NOT NULL,
	"check_out" text NOT NULL,
	"adults" integer DEFAULT 2 NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"total_price" integer NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"source" text DEFAULT 'direct' NOT NULL,
	"special_requests" text,
	"dietary_restrictions" text,
	"transport_needed" boolean DEFAULT false NOT NULL,
	"pfron_certificate" boolean DEFAULT false NOT NULL,
	"discount_applied" integer DEFAULT 0 NOT NULL,
	"promo_code" text,
	"include_breakfast" boolean DEFAULT false NOT NULL,
	"include_dinner" boolean DEFAULT false NOT NULL,
	"payment_method" text DEFAULT 'transfer' NOT NULL,
	"addons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"booking_com_ref" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'double' NOT NULL,
	"base_price" integer NOT NULL,
	"capacity" integer DEFAULT 2 NOT NULL,
	"size" text DEFAULT '20 m²' NOT NULL,
	"bed_config" text DEFAULT '1 łoże małżeńskie' NOT NULL,
	"images" text DEFAULT '[]' NOT NULL,
	"tags" text DEFAULT '[]' NOT NULL,
	"description" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"settings" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "visitor_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"ip" text NOT NULL,
	"country" text NOT NULL,
	"country_code" text NOT NULL,
	"city" text NOT NULL,
	"flag" text NOT NULL,
	"current_page" text NOT NULL,
	"page_title" text NOT NULL,
	"page_views_json" text DEFAULT '{}' NOT NULL,
	"time_on_current_page" integer DEFAULT 0 NOT NULL,
	"total_time_seconds" integer DEFAULT 0 NOT NULL,
	"device" text DEFAULT 'desktop' NOT NULL,
	"browser" text DEFAULT 'Chrome' NOT NULL,
	"first_seen" text NOT NULL,
	"last_seen" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_guest_messages_email" ON "guest_messages" USING btree ("guest_email");--> statement-breakpoint
CREATE INDEX "idx_reservations_availability" ON "reservations" USING btree ("room_id","check_in","check_out","status");--> statement-breakpoint
CREATE INDEX "idx_reservations_guest_email" ON "reservations" USING btree ("guest_email");