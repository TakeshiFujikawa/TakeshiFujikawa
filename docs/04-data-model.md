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
| food_preferences[] | ユーザー本人が明言した苦手・好みの食材／料理（区分：除外／好み、コメント、登録日）。例：`{category: 除外, item: 豆乳鍋}`、`{category: 好み, item: 鍋}`、`{category: 好み, item: 焼魚}`。**「除外」はアレルギーと同様に絶対除外として扱う** |
| seasoning_policy | 調味料・添加物の方針（例：「アミノ酸等の化学調味料はできるだけ使わない」）。献立提案の優先順位づけと、日々の記録（DailyReview）への反映に使用 |
| morning_routine[] | 毎朝の固定ルーティン（[3-4](03-meal-suggestion-spec.md)参照）。項目名・内容・カロリー影響の有無を保持し、日次記録と1日の摂取量計算に反映する |
| health_goal | 減量／維持／増量・筋肉量アップ／**減量＋筋力アップ（ボディリコンポジション）** |
| program_start_date, program_period | プログラム開始日・期間（例：2026-05-30 起算で1年間） |
| target_weight_delta, target_date | 目標とする体重の増減幅・達成目標日（1つだけ保持しシンプルに保つ。例：-15kg／2027-05-30） |

> 例（本アプリが主軸とする「2026年5月30日からの健康管理プログラム」）：
> `health_goal = 減量＋筋力アップ`、`program_start_date = 2026-05-30`、
> `program_period = 1年間`、`target_weight_delta = -15kg`

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

Health Planet等の体組成計が出力する主要指標を保持する
（ユーザーが共有するスクリーンショットから読み取って記録する運用を含む）。

| 属性 | 説明 |
|---|---|
| date | 記録日 |
| weight, body_fat_percentage | 体重・体脂肪率 |
| muscle_mass, muscle_score | 筋肉量・筋肉スコア |
| bmi | BMI |
| muscle_quality_score | 筋質点数 |
| visceral_fat_level | 内臓脂肪レベル（**課題整理で最優先に参照**） |
| estimated_bone_mass | 推定骨量 |
| body_water_percentage | 体水分率 |
| basal_metabolic_rate | 基礎代謝量 |
| metabolic_age | 体内年齢 |
| evaluation[] | 各指標の評価（標準／注意／過剰など。基準値・前回値との比較に使用） |
| source | 自動連携（Bluetooth）／スクリーンショット解析／手入力の区別 |

> ベースライン例（2026-05-14時点）：体重89.15kg・体脂肪率31.4%（肥満）・
> 筋肉量58.00kg（標準）・BMI28.8（肥満1度）・筋質点数89（高い）・
> 内臓脂肪レベル15.5（過剰）・基礎代謝量1,733kcal（少ない）・体内年齢53才

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
| target_meal_type | 提案対象の食事（朝食／昼食／夕食／間食） |
| candidates[] | 提案した献立候補（**5件**。名称・推定カロリー・推定量(g)・推定PFC・提案理由・**食べる順番（eating_order）**） |
| referenced_recipe_sites[] | バリエーションの参照元としたレシピサイト（[3-3条件6](03-meal-suggestion-spec.md)の一覧から） |
| evaluated_conditions | どの条件（3-3の条件1〜6）が提案に影響したかの記録（説明可能性のため保持） |
| advice_text | 添えた一言アドバイス（例：揚げ物が続いている、等） |

## DailyReview（日次の課題整理ログ）

体組成データ（BodyRecord）をもとに、毎日生成する「課題の整理」を保持する。

| 属性 | 説明 |
|---|---|
| id, date | 整理を生成した日 |
| priority_issues[] | 「最優先で改善すべき点」（指標名・数値・評価・コメント） |
| good_points[] | 「良い点」（指標名・数値・評価・コメント） |
| comparison_summary | 前回値・ベースラインとの比較コメント（改善傾向か注意が必要か） |
| based_on_record_id | 元になったBodyRecordへの参照 |

## WeeklyReport（週次レポート）

| 属性 | 説明 |
|---|---|
| period | 対象期間 |
| score_trend | コンディションスコアの推移 |
| summary_good, summary_next | 「よかったこと」「次に向けて」の要約テキスト |
| key_metrics | 体重・運動量・睡眠の主要指標サマリー |
