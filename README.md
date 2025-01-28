# Auto Article Generator

An automated system that generates and publishes articles based on trending topics.

## Features

- Scrapes Google Trends for hot topics
- Generates articles using OpenAI's GPT
- Automatically publishes to WordPress
- Runs on a configurable schedule

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your actual credentials.

3. Start the application:
```bash
npm start
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `WP_SITE_URL`: Your WordPress site URL
- `WP_USERNAME`: WordPress username
- `WP_PASSWORD`: WordPress application password
- `SCRAPE_INTERVAL_MINUTES`: How often to check for new trends (default: 15)
- `MAX_TOPICS`: Maximum number of topics to process per run (default: 5)

## Project Structure

- `src/scraper.js`: Google Trends scraping logic
- `src/generateArticle.js`: Article generation using OpenAI
- `src/publish.js`: WordPress publishing module
- `src/cronJob.js`: Main orchestrator

## Requirements

- Node.js 18+
- WordPress site with REST API enabled
- OpenAI API access
- WordPress application password configured 