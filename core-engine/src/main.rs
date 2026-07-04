use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use sqlx::postgres::PgPoolOptions;
use std::env;

mod api;
mod ledger;
mod crypto;
mod fraud;
mod models;
mod security;

pub struct AppState {
    pub db_pool: sqlx::PgPool,
    pub rate_limiter: security::RateLimiter,
    pub encryption_key: Vec<u8>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/finance_gateway".into());
    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".into());
    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| "9090".into())
        .parse()
        .expect("PORT must be a number");
    let workers: usize = env::var("WORKERS")
        .unwrap_or_else(|_| "4".into())
        .parse()
        .expect("WORKERS must be a number");
    let encryption_key_str = env::var("ENCRYPTION_KEY")
        .unwrap_or_else(|_| "default-dev-key-32-chars-long!!".into());
    let encryption_key = encryption_key_str.as_bytes()[..32].to_vec();

    let db_pool = PgPoolOptions::new()
        .max_connections(50)
        .acquire_timeout(std::time::Duration::from_secs(5))
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    log::info!("Core engine starting on {}:{} with {} workers", host, port, workers);

    let rate_limiter = security::RateLimiter::new(100, 60);

    let app_state = web::Data::new(AppState {
        db_pool: db_pool.clone(),
        rate_limiter,
        encryption_key,
    });

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .app_data(app_state.clone())
            .wrap(cors)
            .wrap(Logger::default())
            .configure(api::config)
    })
    .workers(workers)
    .bind(format!("{}:{}", host, port))?
    .run()
    .await
}
