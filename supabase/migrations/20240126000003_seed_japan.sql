-- World Focus Journey - Seed Data (Japan)
-- Phase 1: Initial Data

-- 日本の都市データ (x, y は抽象的な座標 0-1000)
insert into locations (id, country_code, name, x, y, is_start) values
  ('sapporo', 'JP', '北海道', 820, 150, true),
  ('sendai', 'JP', '仙台', 750, 350, true),
  ('tokyo', 'JP', '東京', 700, 500, true),
  ('yokohama', 'JP', '横浜', 690, 520, false),
  ('nagoya', 'JP', '愛知', 550, 550, true),
  ('kyoto', 'JP', '京都', 450, 530, false),
  ('osaka', 'JP', '大阪', 420, 560, true),
  ('kobe', 'JP', '神戸', 390, 570, false),
  ('hiroshima', 'JP', '広島', 250, 600, false),
  ('fukuoka', 'JP', '福岡', 100, 650, true);

-- ルートデータ（双方向）
insert into paths (from_location_id, to_location_id, distance_km) values
  -- 順方向
  ('tokyo', 'yokohama', 30),
  ('tokyo', 'nagoya', 320),
  ('tokyo', 'sendai', 350),
  ('sendai', 'sapporo', 700),
  ('nagoya', 'osaka', 190),
  ('nagoya', 'kyoto', 120),
  ('osaka', 'fukuoka', 610),
  ('osaka', 'kyoto', 45),
  ('osaka', 'kobe', 30),
  ('kobe', 'hiroshima', 310),
  ('hiroshima', 'fukuoka', 280),
  -- 逆方向
  ('yokohama', 'tokyo', 30),
  ('nagoya', 'tokyo', 320),
  ('sendai', 'tokyo', 350),
  ('sapporo', 'sendai', 700),
  ('osaka', 'nagoya', 190),
  ('kyoto', 'nagoya', 120),
  ('fukuoka', 'osaka', 610),
  ('kyoto', 'osaka', 45),
  ('kobe', 'osaka', 30),
  ('hiroshima', 'kobe', 310),
  ('fukuoka', 'hiroshima', 280);
