-- Seed qurban awal sekarang dikelola langsung di SQL migration ini.
-- File JSON demo lokal lama sudah dihapus dan tidak lagi dipakai.

insert into public.mosque_profiles (
  id,
  name,
  city,
  campaign_year,
  registration_deadline,
  contact_phone,
  bank_info,
  created_at,
  updated_at
) values (
  'main',
  'Masjid Nurul Huda',
  'Bekasi',
  2026,
  '2026-06-03',
  '0812-8800-1144',
  'Transfer manual ke BSI 7788990011 a.n. Panitia Kurban Masjid Nurul Huda',
  '2026-04-01T08:00:00.000Z',
  '2026-04-10T12:00:00.000Z'
)
on conflict (id) do update
set
  name = excluded.name,
  city = excluded.city,
  campaign_year = excluded.campaign_year,
  registration_deadline = excluded.registration_deadline,
  contact_phone = excluded.contact_phone,
  bank_info = excluded.bank_info,
  updated_at = excluded.updated_at;

insert into public.qurban_groups (
  id,
  name,
  animal_type,
  price_per_slot,
  status,
  notes,
  created_at,
  updated_at
) values
  ('grp-cow-1', 'Sapi A - Warga RW 03', 'cow', 2850000, 'open', 'Prioritas jamaah sekitar masjid, masih bisa umum.', '2026-04-01T08:00:00.000Z', '2026-04-09T09:30:00.000Z'),
  ('grp-cow-2', 'Sapi B - Karyawan Kantor', 'cow', 2900000, 'open', 'Lokasi pengumpulan terpisah di gedung serbaguna.', '2026-04-02T08:00:00.000Z', '2026-04-10T10:10:00.000Z'),
  ('grp-cow-3', 'Sapi C - Alumni Remaja Masjid', 'cow', 2800000, 'open', 'Tinggal sedikit slot, diprioritaskan pelunasan cepat.', '2026-04-03T08:00:00.000Z', '2026-04-10T12:00:00.000Z'),
  ('grp-goat-1', 'Kambing Premium 01', 'goat', 3600000, 'open', 'Termasuk dokumentasi distribusi daging.', '2026-04-02T08:00:00.000Z', '2026-04-10T07:00:00.000Z'),
  ('grp-sheep-1', 'Domba Keluarga 01', 'sheep', 3250000, 'closed', 'Sudah penuh, menunggu konfirmasi pembayaran akhir.', '2026-04-04T08:00:00.000Z', '2026-04-10T07:00:00.000Z')
on conflict (id) do update
set
  name = excluded.name,
  animal_type = excluded.animal_type,
  price_per_slot = excluded.price_per_slot,
  status = excluded.status,
  notes = excluded.notes,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.qurban_participants (
  id,
  group_id,
  full_name,
  phone,
  normalized_phone,
  city,
  notes,
  payment_status,
  registered_at,
  created_at,
  updated_at
) values
  ('pt-001', 'grp-cow-1', 'Ahmad Fauzi', '0813-2000-1101', public.qurban_normalize_phone('0813-2000-1101'), 'Jakarta Selatan', 'Transfer DP masuk.', 'partial', '2026-04-05T02:10:00.000Z', '2026-04-05T02:10:00.000Z', '2026-04-05T02:10:00.000Z'),
  ('pt-002', 'grp-cow-1', 'Sarah Nabila', '0812-7711-8800', public.qurban_normalize_phone('0812-7711-8800'), 'Jakarta Selatan', 'Daftar via landing page.', 'pending', '2026-04-05T06:30:00.000Z', '2026-04-05T06:30:00.000Z', '2026-04-05T06:30:00.000Z'),
  ('pt-003', 'grp-cow-1', 'Budi Santoso', '0817-1122-3344', public.qurban_normalize_phone('0817-1122-3344'), 'Depok', 'Titip nama keluarga.', 'paid', '2026-04-06T02:10:00.000Z', '2026-04-06T02:10:00.000Z', '2026-04-06T02:10:00.000Z'),
  ('pt-004', 'grp-cow-1', 'Ika Maharani', '0812-9988-7766', public.qurban_normalize_phone('0812-9988-7766'), 'Jakarta Selatan', 'Perlu kuitansi PDF nanti.', 'partial', '2026-04-06T07:30:00.000Z', '2026-04-06T07:30:00.000Z', '2026-04-06T07:30:00.000Z'),
  ('pt-005', 'grp-cow-1', 'Rizky Firmansyah', '0819-7000-4433', public.qurban_normalize_phone('0819-7000-4433'), 'Bekasi', 'Rekomendasi takmir.', 'pending', '2026-04-07T04:50:00.000Z', '2026-04-07T04:50:00.000Z', '2026-04-07T04:50:00.000Z'),
  ('pt-006', 'grp-cow-2', 'Dina Azzahra', '0812-2222-7777', public.qurban_normalize_phone('0812-2222-7777'), 'Jakarta Timur', 'Panitia follow up pelunasan.', 'partial', '2026-04-07T01:10:00.000Z', '2026-04-07T01:10:00.000Z', '2026-04-07T01:10:00.000Z'),
  ('pt-007', 'grp-cow-2', 'Yusuf Kurniawan', '0813-7700-8822', public.qurban_normalize_phone('0813-7700-8822'), 'Jakarta Timur', 'Minta update progres grup.', 'pending', '2026-04-07T05:00:00.000Z', '2026-04-07T05:00:00.000Z', '2026-04-07T05:00:00.000Z'),
  ('pt-008', 'grp-cow-2', 'Maya Lestari', '0816-1111-4411', public.qurban_normalize_phone('0816-1111-4411'), 'Jakarta Selatan', 'Butuh pengingat H-7.', 'paid', '2026-04-08T03:00:00.000Z', '2026-04-08T03:00:00.000Z', '2026-04-08T03:00:00.000Z'),
  ('pt-009', 'grp-cow-3', 'Fikri Ramadhan', '0815-4545-1001', public.qurban_normalize_phone('0815-4545-1001'), 'Tangerang Selatan', 'Alumni angkatan 2015.', 'partial', '2026-04-08T08:15:00.000Z', '2026-04-08T08:15:00.000Z', '2026-04-08T08:15:00.000Z'),
  ('pt-010', 'grp-cow-3', 'Nadia Putri', '0819-9000-8181', public.qurban_normalize_phone('0819-9000-8181'), 'Jakarta Selatan', 'Daftar kolektif keluarga.', 'paid', '2026-04-09T04:00:00.000Z', '2026-04-09T04:00:00.000Z', '2026-04-09T04:00:00.000Z'),
  ('pt-011', 'grp-cow-3', 'Rafi Hidayat', '0817-0044-2211', public.qurban_normalize_phone('0817-0044-2211'), 'Bogor', 'Mau pelunasan pekan depan.', 'pending', '2026-04-09T11:15:00.000Z', '2026-04-09T11:15:00.000Z', '2026-04-09T11:15:00.000Z'),
  ('pt-012', 'grp-cow-3', 'Sinta Khairunnisa', '0812-5544-6622', public.qurban_normalize_phone('0812-5544-6622'), 'Jakarta Selatan', 'Perlu nama keluarga di label distribusi.', 'paid', '2026-04-09T13:30:00.000Z', '2026-04-09T13:30:00.000Z', '2026-04-09T13:30:00.000Z'),
  ('pt-013', 'grp-cow-3', 'Fadli Akbar', '0813-7890-1212', public.qurban_normalize_phone('0813-7890-1212'), 'Depok', 'Kandidat slot urgent.', 'pending', '2026-04-10T02:10:00.000Z', '2026-04-10T02:10:00.000Z', '2026-04-10T02:10:00.000Z'),
  ('pt-014', 'grp-cow-3', 'Lina Marfuah', '0813-2244-5500', public.qurban_normalize_phone('0813-2244-5500'), 'Jakarta Selatan', 'Sudah kirim bukti transfer.', 'partial', '2026-04-10T03:25:00.000Z', '2026-04-10T03:25:00.000Z', '2026-04-10T03:25:00.000Z'),
  ('pt-015', 'grp-goat-1', 'Rendra Nugroho', '0812-0033-4455', public.qurban_normalize_phone('0812-0033-4455'), 'Jakarta Selatan', 'Menanyakan opsi kambing kedua.', 'pending', '2026-04-10T04:45:00.000Z', '2026-04-10T04:45:00.000Z', '2026-04-10T04:45:00.000Z'),
  ('pt-016', 'grp-sheep-1', 'Keluarga H. Hasan', '0812-7777-1000', public.qurban_normalize_phone('0812-7777-1000'), 'Jakarta Selatan', 'Domba sudah dikunci untuk keluarga inti.', 'paid', '2026-04-08T01:45:00.000Z', '2026-04-08T01:45:00.000Z', '2026-04-08T01:45:00.000Z')
on conflict (id) do update
set
  group_id = excluded.group_id,
  full_name = excluded.full_name,
  phone = excluded.phone,
  normalized_phone = excluded.normalized_phone,
  city = excluded.city,
  notes = excluded.notes,
  payment_status = excluded.payment_status,
  registered_at = excluded.registered_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;
