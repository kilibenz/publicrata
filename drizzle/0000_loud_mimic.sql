CREATE TYPE "public"."topic_status" AS ENUM('draft', 'open', 'closed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."topic_type" AS ENUM('bundestag', 'user_proposal');--> statement-breakpoint
CREATE TYPE "public"."vote_choice" AS ENUM('yes', 'no', 'abstain');--> statement-breakpoint
CREATE TABLE "bundestag_vorgaenge" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bundestag_vorgaenge_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"dip_id" integer NOT NULL,
	"titel" text NOT NULL,
	"abstract" text,
	"vorgangstyp" varchar(255),
	"beratungsstand" varchar(255),
	"wahlperiode" integer,
	"datum" date,
	"deskriptoren" jsonb,
	"raw_json" jsonb,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bundestag_vorgaenge_dip_id_unique" UNIQUE("dip_id")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"parent_id" uuid,
	"author_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"eid_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	"choice" "vote_choice" NOT NULL,
	"voted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voting_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "topic_type" NOT NULL,
	"bundestag_vorgang_id" integer,
	"author_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"voting_opens_at" timestamp with time zone,
	"voting_closes_at" timestamp with time zone,
	"status" "topic_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_topic_id_voting_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."voting_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_topic_id_voting_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."voting_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voting_topics" ADD CONSTRAINT "voting_topics_bundestag_vorgang_id_bundestag_vorgaenge_id_fk" FOREIGN KEY ("bundestag_vorgang_id") REFERENCES "public"."bundestag_vorgaenge"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voting_topics" ADD CONSTRAINT "voting_topics_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "votes_user_topic_idx" ON "votes" USING btree ("user_id","topic_id");