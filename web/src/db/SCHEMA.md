# ParentPrompt Database Schema Documentation

This document provides an overview of the database schema for the ParentPrompt application.

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│    users    │       │   children   │       │    prompts   │
├─────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)     │       │ id (PK)      │       │ id (PK)      │
│ email       │       │ user_id (FK) │       │ content      │
│ first_name  │◄──────┤ name         │       │ type         │
│ last_name   │       │ birthdate    │       │ age_range[]  │
│ phone_number│       │ interests[]  │       │ tags[]       │
│ created_at  │       │ created_at   │       │ created_at   │
│ updated_at  │       │ updated_at   │       │ updated_at   │
└─────────────┘       └──────────────┘       └──────────────┘
       ▲                                              ▲
       │                                              │
       │                                              │
       │                                              │
       │                                              │
       │               ┌──────────────┐               │
       │               │ user_prompts │               │
       │               ├──────────────┤               │
       └───────────────┤ id (PK)      ├───────────────┘
                       │ user_id (FK) │
                       │ prompt_id(FK)│
                       │ completed    │
                       │ favorited    │
                       │ scheduled_for│
                       │ delivered_at │
                       │ notes        │
                       │ created_at   │
                       │ updated_at   │
                       └──────────────┘
                              ▲
                              │
                              │
                              │
                              │
                       ┌──────────────────┐
                       │ user_preferences │
                       ├──────────────────┤
                       │ id (PK)          │
                       │ user_id (FK)     │
                       │ preferred_time   │
                       │ notification_method│
                       │ frequency        │
                       │ custom_frequency │
                       │ categories[]     │
                       │ created_at       │
                       │ updated_at       │
                       └──────────────────┘
```

## Tables

### users

Extends the Supabase auth.users table to store additional user information.

| Column        | Type                     | Description                           |
|---------------|--------------------------|---------------------------------------|
| id            | UUID (PK, FK)            | Primary key, references auth.users(id)|
| email         | TEXT                     | User's email address                  |
| first_name    | TEXT                     | User's first name                     |
| last_name     | TEXT                     | User's last name                      |
| phone_number  | TEXT                     | User's phone number (optional)        |
| created_at    | TIMESTAMP WITH TIME ZONE | Record creation timestamp             |
| updated_at    | TIMESTAMP WITH TIME ZONE | Record update timestamp               |

### children

Stores information about the children associated with a user.

| Column        | Type                     | Description                           |
|---------------|--------------------------|---------------------------------------|
| id            | UUID (PK)                | Primary key                           |
| user_id       | UUID (FK)                | References users(id)                  |
| name          | TEXT                     | Child's name                          |
| birthdate     | DATE                     | Child's date of birth                 |
| interests     | TEXT[]                   | Array of child's interests            |
| created_at    | TIMESTAMP WITH TIME ZONE | Record creation timestamp             |
| updated_at    | TIMESTAMP WITH TIME ZONE | Record update timestamp               |

### prompts

Stores the prompt content and metadata.

| Column        | Type                     | Description                           |
|---------------|--------------------------|---------------------------------------|
| id            | UUID (PK)                | Primary key                           |
| content       | TEXT                     | The prompt text                       |
| type          | TEXT                     | Type of prompt (e.g., activity, conversation) |
| age_range     | TEXT[]                   | Array of age ranges this prompt is appropriate for |
| tags          | TEXT[]                   | Array of tags for categorization      |
| created_at    | TIMESTAMP WITH TIME ZONE | Record creation timestamp             |
| updated_at    | TIMESTAMP WITH TIME ZONE | Record update timestamp               |

### user_prompts

Junction table that associates users with prompts and tracks user interactions.

| Column        | Type                     | Description                           |
|---------------|--------------------------|---------------------------------------|
| id            | UUID (PK)                | Primary key                           |
| user_id       | UUID (FK)                | References users(id)                  |
| prompt_id     | UUID (FK)                | References prompts(id)                |
| completed     | BOOLEAN                  | Whether the prompt was completed      |
| favorited     | BOOLEAN                  | Whether the user favorited the prompt |
| scheduled_for | TIMESTAMP WITH TIME ZONE | When the prompt is scheduled to be delivered |
| delivered_at  | TIMESTAMP WITH TIME ZONE | When the prompt was delivered         |
| notes         | TEXT                     | User notes about the prompt           |
| created_at    | TIMESTAMP WITH TIME ZONE | Record creation timestamp             |
| updated_at    | TIMESTAMP WITH TIME ZONE | Record update timestamp               |

### user_preferences

Stores user preferences for prompt delivery and notification.

| Column             | Type                     | Description                           |
|--------------------|--------------------------|---------------------------------------|
| id                 | UUID (PK)                | Primary key                           |
| user_id            | UUID (FK)                | References users(id)                  |
| preferred_time     | TIME                     | Preferred time for prompt delivery    |
| notification_method| TEXT                     | Method for notifications (email, sms, etc.) |
| frequency          | TEXT                     | Frequency of prompts (daily, weekly, etc.) |
| custom_frequency   | TEXT                     | Custom frequency specification        |
| categories         | TEXT[]                   | Array of preferred prompt categories  |
| created_at         | TIMESTAMP WITH TIME ZONE | Record creation timestamp             |
| updated_at         | TIMESTAMP WITH TIME ZONE | Record update timestamp               |

## Indexes

The following indexes are created for performance optimization:

- `idx_children_user_id` on `children(user_id)`
- `idx_user_prompts_user_id` on `user_prompts(user_id)`
- `idx_user_prompts_prompt_id` on `user_prompts(prompt_id)`
- `idx_user_prompts_scheduled_for` on `user_prompts(scheduled_for)`
- `idx_prompts_type` on `prompts(type)`
- `idx_prompts_age_range` on `prompts(age_range)` using GIN
- `idx_prompts_tags` on `prompts(tags)` using GIN

## Row Level Security (RLS) Policies

All tables have Row Level Security enabled with appropriate policies:

### users
- Users can only view and update their own data

### children
- Users can only view, insert, update, and delete their own children's data

### prompts
- All authenticated users can view prompts

### user_prompts
- Users can only view, insert, update, and delete their own prompt interactions

### user_preferences
- Users can only view, insert, update, and delete their own preferences

## Triggers

### Updated Timestamps
All tables have triggers to automatically update the `updated_at` column whenever a record is updated.

### New User Registration
A trigger on `auth.users` automatically creates a corresponding record in the `users` table when a new user registers.
