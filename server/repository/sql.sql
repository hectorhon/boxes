CREATE TABLE public.boxes_contacts (
    id serial primary key,
    name character varying,
    phone character varying,
    vcard jsonb,
    meta jsonb,
    last_updated timestamp with time zone,
    "group" character varying,
    birthday date,
    is_birthday_estimated boolean DEFAULT false NOT NULL
);

CREATE TABLE public.boxes_filestore (
    id serial primary key,
    title character varying,
    path character varying,
    add_date timestamp with time zone,
    mime_type character varying,
    entry_date timestamp with time zone,
    thumbnail_path character varying,
    meta jsonb,
    tags jsonb
);
