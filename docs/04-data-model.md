# 4. データモデル（概略）

実装方針を決める前段階のため、エンティティと主要属性のみを定義する。
（型・正規化・DBMSの選定は技術選定後に詳細化する）

## User（プロフィール）

| 属性 | 説明 |
|---|---|
| id | ユーザーID |
| age, sex, height | 基礎代謝計算に使用 |
| activity_level | 普段の活動量（座りがち〜高活動） |
| allergies[] | アレルギー食材リスト（**献立提案で最優先に参照**） |
| dietary_restrictions[] | ベジタリアン／ヴィーガン／ハラール等の食事制限 |
| health_goal | 減量／維持／増量・筋肉量アップ |
| target_weight, target_date | 体重目標（1つだけ保持しシンプルに保つ） |

## ConditionScore（日次コンディションスコア）

| 属性 | 説明 |
|---|---|
| date | 対象日 |
| total_score | 0〜100の統合スコア |
| recovery_score | 回復スコア（睡眠・安静時心拍等から算出。WHOOP相当） |
| activity_score | 活動バランススコア（運動負荷と回復のバランス） |
| nutrition_score | 栄養バランススコア（直近の食事ログから算出） |
| comment | ユーザー向けの要約コメント（生活言語に翻訳済みの一言） |

## BodyRecord（体組成記録）

| 属性 | 説明 |
|---|---|
| date | 記録日 |
| weight, body_fat_percentage | 体重・体脂肪率（スマート体組成計と自動同期） |
| source | 自動連携／手入力の区別 |

## SleepRecord（睡眠記録）

| 属性 | 説明 |
|---|---|
| date | 対象日（就寝日） |
| duration, efficiency | 睡眠時間・睡眠効率 |
| resting_heart_rate, hrv | 安静時心拍・心拍変動（WHOOP相当の指標） |

## Workout（運動記録）

| 属性 | 説明 |
|---|---|
| id, date, type | ラン／ウォーク／その他 |
| duration, distance, pace | GPSベースの記録（Runkeeper相当） |
| route | GPSログ（地図表示用） |
| estimated_calories | 推定消費カロリー（食事提案のカロリー収支計算に使用） |
| strain | 運動負荷の指標（コンディションスコアの算出に使用） |

## Meal（食事記録）

| 属性 | 説明 |
|---|---|
| id, datetime, meal_type | 朝食／昼食／夕食／間食 |
| photo_url | 撮影した食事写真 |
| recognized_items[] | 画像解析で推定された品目リスト（名称・推定量） |
| estimated_calories, estimated_pfc | 推定カロリー・タンパク質/脂質/炭水化物 |
| user_corrected | ユーザーが内容を修正したかどうか（解析精度向上のフィードバックに利用） |

## MealSuggestion（献立提案ログ）

| 属性 | 説明 |
|---|---|
| id, datetime | 提案を生成した日時 |
| target_meal_type | 提案対象の食事（次の食事） |
| candidates[] | 提案した献立候補（名称・推定カロリー・推定PFC・提案理由） |
| evaluated_conditions | どの条件（3-3の条件1〜6）が提案に影響したかの記録（説明可能性のため保持） |
| advice_text | 添えた一言アドバイス（例：揚げ物が続いている、等） |

## WeeklyReport（週次レポート）

| 属性 | 説明 |
|---|---|
| period | 対象期間 |
| score_trend | コンディションスコアの推移 |
| summary_good, summary_next | 「よかったこと」「次に向けて」の要約テキスト |
| key_metrics | 体重・運動量・睡眠の主要指標サマリー |
