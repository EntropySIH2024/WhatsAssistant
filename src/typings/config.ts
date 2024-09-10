export interface IConfig {
    /** Name of the directory for storing the session of the chatbot */
    session_dir: string
    /** Name of the filename (json) where your google cloud credentials is saved */
    google_cloud_credentials_path: string
    /** API key for OpenAI */
    openai_api_key: string
}
