class Notification
    include Dynamoid::Document
  
    table name: :notifications, key: :notification_id
    field :notification_id, :integer
    field :username, :string
    field :message, :string
    field :phone, :string
    field :time, :string
    field :day, :string
end
  