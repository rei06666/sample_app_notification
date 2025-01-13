# sample_app_notification
このアプリケーションはSMS通知作成用アプリケーション  
AWS上に構築する

# 前提条件
- 1つのインスタンスにfrontendとbackendをデプロイ
- AWS上のネットワーク設定、他サービス(DynamoDB, Lambdaなど)は完了済み
- インスタンスにはDockerとDocker composeがインストール済み


# 構築手順
インスタンス上で以下手順を行う

1. .envファイルの作成
/backendと/frontendに.envを作成し、以下を記載する  

    /backend/.env
    ```bash
    AWS_DYNAMODB_NOTIFICATION_TABLE="DynamoDBのテーブル名"
    AWS_LAMBDA_ARN="LambdaのARN"
    AWS_EVENTBRIDGE_ROLE_ARN="EventBridge用ロールのARN"
    AWS_COGNITO_CLIENT_ID="CognitoのクライアントID"
    AWS_DEFAULT_REGION="使用するリージョン”"
    FRONTEND_URL="フロントエンドのURL"
    ```

    /frontend/.env
    ```bash
    REACT_APP_BACKEND_URL="backendのURL"
    ```

2. frontendフォルダ内で以下を実行する  
    ```bash
    npm install
    ```

3. イメージのビルドを行う
    ```bash
    docker compose build
    ```

4. アプリケーションを立ち上げる
    ```bash
    docker compose up
    ```