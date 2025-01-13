require 'aws-sdk-dynamodb'
require 'aws-sdk-scheduler'

class NotificationController < ApplicationController
  def create
    username = params[:username]
    message = params[:message]
    phone = params[:phone]
    time = params[:time]
    day = params[:day]

    begin
      # DynamoDB クライアントを初期化
      dynamodb = Aws::DynamoDB::Client.new() 
  
      # テーブル名を指定
      table_name = ENV['AWS_DYNAMODB_NOTIFICATION_TABLE']
  
      # 最大の notification_id を取得する (スキャン操作)
      result = dynamodb.scan(
        table_name: table_name,
        projection_expression: 'notification_id'
      )
  
      # 最大 ID を取得
      max_id = result.items.map { |item| item['notification_id'].to_i }.max || 0
      notification_id = max_id + 1
  
      # データをテーブルに挿入
      dynamodb.put_item({
        table_name: table_name,
        item: {
          'notification_id' => notification_id,
          'username' => username,
          'message' => message,
          'phone' => phone,
          'notification_time' => time,
          'day_of_week' => day
        }
      })

       # EventBridge クライアントを初期化
       scheduler = Aws::Scheduler::Client.new()

       # Lambdaのターゲット設定
       lambda_target_arn = ENV['AWS_LAMBDA_ARN']

       # 日曜日から土曜日への曜日マッピング
      day_mapping = {
        'MON' => 1,
        'TUE' => 2,
        'WED' => 3,
        'THU' => 4,
        'FRI' => 5,
        'SAT' => 6,
        'SUN' => 7
      }

      day_of_week = day_mapping[day]  # 曜日の数字
      hour, minute = time.split(":").map(&:to_i) # 時間と分に分ける
      # 日本時間 (JST) を UTC に変換
      utc_hour = hour - 9
      utc_hour += 24 if utc_hour < 0  
      day_of_week -= 1 if utc_hour < 0

      cron_expression = "cron(#{minute} #{utc_hour} ? * #{day_of_week} *)"

      # EventBridge スケジュールルールを作成
      schedule_name = "lambda_notification_#{day}_#{hour}#{minute}"

      # 既存のスケジュールを確認
      existing_schedules = scheduler.list_schedules({
        name_prefix: schedule_name
      })
      if existing_schedules.schedules.any?
        # すでに同じ名前のルールが存在する場合、作成しない
        render json: { message: "The rule with this name already exists" }, status: :ok
        return
      end

      # EventBridge Scheduler でスケジュール作成
      scheduler.create_schedule({
        name: schedule_name,
        schedule_expression: cron_expression,
        flexible_time_window: { 
          mode: "OFF", # required, accepts OFF, FLEXIBLE
        },
        target: {
          arn: lambda_target_arn,
          role_arn: ENV['AWS_EVENTBRIDGE_ROLE_ARN'],
          input: {
            "detail-type": "Scheduled Event",
            "detail": {
              "notification_time": time
            }
          }.to_json
        },
      })
      render json: { message: "追加成功" }, status: :ok

    rescue => e
      puts e
      render json: { error: "エラーが発生しました: #{e.message}" }, status: :internal_server_error
    end
  end

  def delete
    username = params[:username]
    message = params[:message]
    phone = params[:phone]
    time = params[:time]
    day = params[:day]

    begin
      # DynamoDB クライアントを初期化
      dynamodb = Aws::DynamoDB::Client.new() 
      # テーブル名を指定
      table_name = ENV['AWS_DYNAMODB_NOTIFICATION_TABLE'] 
      # 該当するアイテムを検索
      result = dynamodb.scan(
        table_name: table_name,
        filter_expression: 'username = :username AND message = :message AND phone = :phone AND notification_time = :notification_time AND day_of_week = :day_of_week',
        expression_attribute_values: {
          ':username' => username,
          ':message' => message,
          ':phone' => phone,
          ':notification_time' => time,
          ':day_of_week' => day
        }
      )
      # 結果が見つかった場合
      if result.items.any?
        item = result.items.first 
        dynamodb.delete_item(
          table_name: table_name,
          key: {
            'notification_id' => item['notification_id'] # プライマリキーを指定
          }
        )
        render json: { message: 'Notification deleted successfully' }, status: :ok
      else
        render json: { error: 'Notification not found' }, status: :not_found
      end
    rescue Aws::DynamoDB::Errors::ServiceError => e
      puts e
      render json: { error: "DynamoDB エラー: #{e.message}" }, status: :internal_server_error
    rescue => e
      puts e
      render json: { error: "エラーが発生しました: #{e.message}" }, status: :internal_server_error
    end
  end

  def read
    begin
      # パラメータから username を取得
      username = params[:username]
      # DynamoDB クライアントを初期化
      dynamodb = Aws::DynamoDB::Client.new()
      # テーブル名を指定
      table_name = ENV['AWS_DYNAMODB_NOTIFICATION_TABLE'] 
      # 該当データを取得
      result = dynamodb.scan(
        table_name: table_name,
        filter_expression: 'username = :username',
        expression_attribute_values: {
          ':username' => username
        },
        projection_expression: 'username, message, phone, notification_time, day_of_week' # 必要な項目のみを取得
      )

      puts result.items
  
      render json: { 
        notifications: result.items,
      }, status: :ok
    rescue Aws::DynamoDB::Errors::ServiceError => e
      # DynamoDB に関するエラーをキャッチ
      puts e
      render json: { error: "DynamoDB エラー: #{e.message}" }, status: :internal_server_error
    rescue => e
      # 一般的なエラーをキャッチ
      puts e
      render json: { error: "エラーが発生しました: #{e.message}" }, status: :internal_server_error
    end
  end

end