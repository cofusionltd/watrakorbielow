CREATE TABLE "mailbox_integrations" (
	"provider" text PRIMARY KEY NOT NULL,
	"account_email" text NOT NULL,
	"encrypted_refresh_token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mailbox_oauth_states" (
	"state_hash" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
