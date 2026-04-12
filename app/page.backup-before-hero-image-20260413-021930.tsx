import Link from 'next/link';
import { ArrowRight, Users, Calendar, Wallet, Clock, CheckCircle2, Sparkles, ChevronRight, BadgeCheck, Phone, ShieldCheck } from 'lucide-react';

import { AutoRefresh } from '@/components/auto-refresh';
import { SectionHeading } from '@/components/section-heading';
import { StatusBadge } from '@/components/status-badge';
import { HomeAnimations } from '@/components/animations/home-animations';
import { getPublicData } from '@/lib/services/qurban-service';
import { formatCurrency } from '@/lib/utils';
import { getAnimalLabel } from '@/lib/validation';

export default async function HomePage() {
  const { mosque, groups, metrics } = await getPublicData();
  const urgentGroups = groups.filter((group) => group.isUrgent && group.status === 'open');
  const openGroups = groups.filter((group) => group.status === 'open' && !group.isFull);
  const featuredGroups = [
    ...urgentGroups,
    ...openGroups.filter((group) => !group.isUrgent),
    ...groups.filter((group) => group.isFull || group.status !== 'open'),
  ];

  return (
    <HomeAnimations>
      <main className="relative">
        <AutoRefresh />

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-pine/5 via-transparent to-transparent dark:from-pine/10" />
            <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-gold/20 blur-3xl dark:bg-gold/10" />
            <div className="absolute right-1/4 top-40 h-80 w-80 rounded-full bg-palm/15 blur-3xl dark:bg-palm/20" />
          </div>

          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
              <div className="hero-animate flex flex-col justify-center space-y-6 lg:space-y-8">
                <div className="hero-animate inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-medium text-pine dark:border-gold/20 dark:bg-gold/10 dark:text-gold">
                  <Sparkles className="h-4 w-4" />
                  <span className="break-words">Transparansi Slot Kurban {mosque.campaignYear}</span>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  <h1 className="hero-animate max-w-5xl font-serif-display text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.04em] text-pine dark:text-stone-100 sm:text-[3.35rem] lg:text-[4.15rem]">
                    Wujudkan niat kurban{' '}
                    <span className="relative inline-flex text-palm">
                      <span className="relative z-10">dengan lebih mudah</span>
                      <span className="absolute bottom-0 left-0 right-0 h-[0.42em] rounded-[999px] bg-gradient-to-r from-gold/0 via-gold/28 to-gold/0 dark:via-gold/18" />
                    </span>
                  </h1>
                  <p className="hero-animate max-w-2xl text-[1rem] leading-7 text-stone-600 dark:text-stone-300 sm:text-[1.06rem] sm:leading-8">
                    Jamaah dapat melihat ketersediaan grup secara real-time, memilih patungan yang sesuai, lalu mendaftar dengan alur yang ringkas dan mudah dipahami.
                  </p>
                </div>

                <div className="hero-animate flex flex-wrap gap-3 sm:gap-4">
                  <Link
                    href="/register"
                    className="cta-animate button-primary group gap-2 px-6 py-3.5 sm:px-7 sm:py-4"
                  >
                    Daftar Sekarang
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="#slot-tersedia"
                    className="cta-animate button-secondary gap-2 px-6 py-3.5 sm:px-7 sm:py-4"
                  >
                    Lihat Slot Tersedia
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="hero-animate grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-900/70">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Slot Tersedia</p>
                    <p className="mt-2 text-3xl font-bold text-pine dark:text-stone-100">{metrics.availableSlots}</p>
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Masih bisa dipilih sekarang</p>
                  </div>
                  <div className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-900/70">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Grup Prioritas</p>
                    <p className="mt-2 text-3xl font-bold text-ember">{metrics.urgentGroups}</p>
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Tinggal 1-2 slot lagi</p>
                  </div>
                  <div className="rounded-[22px] border border-white/70 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-900/70">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Peserta Masuk</p>
                    <p className="mt-2 text-3xl font-bold text-pine dark:text-stone-100">{metrics.totalParticipants}</p>
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Update otomatis dari formulir</p>
                  </div>
                </div>

                <div className="hero-animate flex flex-col gap-3 border-t border-stone-200/80 pt-5 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-300 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2 sm:items-center">
                    <ShieldCheck className="h-4 w-4 text-palm" />
                    <span className="max-w-xl">Login panitia tetap tersedia tanpa mengganggu alur pendaftaran publik.</span>
                  </div>
                  <Link href="/auth/login" className="inline-flex items-center gap-2 font-semibold text-pine transition hover:text-palm dark:text-stone-100 dark:hover:text-gold">
                    Login Panitia
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="hero-animate relative flex items-center justify-center lg:justify-end">
                <div className="relative w-full max-w-lg">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-pine/20 via-palm/10 to-gold/20 blur-2xl dark:from-pine/30 dark:via-palm/20 dark:to-gold/10" />
                  <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-br from-pine to-palm p-6 text-white shadow-2xl dark:border-stone-700/50 sm:p-8">
                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
                    <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                    
                    <div className="relative space-y-5">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold/90">Ringkasan Pendaftaran</p>
                        <h2 className="font-serif-display text-3xl font-bold leading-tight text-white">Mulai dari grup yang masih terbuka</h2>
                        <p className="text-sm leading-relaxed text-white/75 sm:text-base">
                          Fokuskan langkah pertama pada slot yang tersedia sekarang, lalu lanjutkan pendaftaran dari grup pilihan Anda.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                              <Calendar className="h-5 w-5 text-gold" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.16em] text-white/60">Batas Daftar</p>
                              <p className="font-semibold">{mosque.registrationDeadline}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                              <BadgeCheck className="h-5 w-5 text-gold" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.16em] text-white/60">Grup Terbuka</p>
                              <p className="font-semibold">{openGroups.length} grup siap dipilih</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                        <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                          <Clock className="h-4 w-4 text-gold" />
                          Slot Prioritas Hari Ini
                        </p>
                        <div className="space-y-2">
                          {urgentGroups.length > 0 ? (
                            urgentGroups.slice(0, 2).map((group) => (
                              <div key={group.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/10 p-3">
                                <div>
                                  <p className="text-sm font-medium">{group.name}</p>
                                  <p className="text-xs text-white/65">{getAnimalLabel(group.animalType)}</p>
                                </div>
                                <span className="rounded-full bg-ember/20 px-2 py-1 text-xs font-semibold text-amber-200">
                                  {group.slotsLeft} slot lagi
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-white/70">Belum ada grup urgent saat ini.</p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-2">
                        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                          <Wallet className="h-4 w-4 shrink-0 text-gold" />
                          <span className="break-words leading-6 sm:line-clamp-1">{mosque.bankInfo}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                          <Phone className="h-4 w-4 shrink-0 text-gold" />
                          <span>{mosque.contactPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Groups Section */}
        <section id="slot-tersedia" className="section-anchor-offset mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="section-heading-animate mb-10 sm:mb-12">
            <SectionHeading
              eyebrow="Ketersediaan"
              title="Pilih grup yang masih tersedia"
              description="Mulai dari grup yang terbuka atau hampir penuh agar proses patungan lebih cepat terkumpul. Grup yang sudah penuh tetap ditampilkan untuk menjaga transparansi status panitia."
            />
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {featuredGroups.map((group) => {
              const progressPercent = (group.filledSlots / group.capacity) * 100;
              const isAvailable = !group.isFull && group.status === 'open';
              const hasTopBadge = group.isUrgent || group.isFull;

              return (
                <article
                  key={group.id}
                  className={`group-card group relative flex h-full flex-col overflow-hidden rounded-[28px] border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-stone-900/80 ${
                    group.isUrgent
                      ? 'border-ember/30 shadow-ember/10 hover:shadow-ember/20'
                      : 'border-stone-200/80 dark:border-stone-800'
                  }`}
                >
                  {hasTopBadge ? (
                    <div className="absolute right-4 top-4 z-10">
                      {group.isUrgent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-ember/10 px-3 py-1 text-xs font-semibold text-ember dark:bg-ember/20 dark:text-amber-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                          Urgent
                        </span>
                      ) : (
                        <StatusBadge label="Penuh" tone="muted" />
                      )}
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className={`mb-4 flex items-start gap-4 ${hasTopBadge ? 'pr-24' : ''}`}>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                          {getAnimalLabel(group.animalType)}
                        </p>
                        <h3 className="mt-1 text-xl font-bold text-pine dark:text-stone-100">{group.name}</h3>
                      </div>
                    </div>

                    <p className="mb-5 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{group.notes}</p>

                    <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-sand/80 p-4 dark:bg-stone-800/50">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Status Slot</p>
                        <p className={`mt-2 text-lg font-bold ${group.isUrgent ? 'text-ember' : 'text-pine dark:text-stone-100'}`}>
                          {group.isFull ? 'Sudah penuh' : `${group.slotsLeft} slot tersisa`}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-sand/80 p-4 dark:bg-stone-800/50">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Harga / Slot</p>
                        <p className="mt-2 text-lg font-bold text-pine dark:text-stone-100">{formatCurrency(group.pricePerSlot)}</p>
                      </div>
                    </div>

                    <div className="mb-5 rounded-2xl bg-sand/80 p-4 dark:bg-stone-800/50">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-stone-600 dark:text-stone-400">Progress</span>
                        <span className="font-semibold text-pine dark:text-stone-200">
                          {group.filledSlots}/{group.capacity}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white dark:bg-stone-700">
                        <div
                          className={`progress-bar-fill h-full rounded-full transition-all duration-500 ${
                            group.isUrgent ? 'bg-ember' : 'bg-palm'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-stone-300/30 pt-3 dark:border-stone-700/50">
                        <span className="text-sm text-stone-600 dark:text-stone-400">Kapasitas grup</span>
                        <span className="text-sm font-semibold text-pine dark:text-stone-100">{group.capacity} peserta</span>
                      </div>
                    </div>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-start justify-between gap-3 text-sm text-stone-500 dark:text-stone-400">
                        <span className="pr-2">{isAvailable ? 'Bisa langsung dipilih di formulir.' : 'Tetap terlihat untuk referensi jamaah.'}</span>
                        <span className="font-semibold text-stone-700 dark:text-stone-200">{Math.round(progressPercent)}%</span>
                      </div>
                      <Link
                        href={isAvailable ? `/register?groupId=${group.id}` : '/register'}
                        className={`group/btn flex items-center justify-between rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all ${
                          isAvailable
                            ? 'bg-pine text-white hover:bg-palm'
                            : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                      >
                        <span>{isAvailable ? 'Daftar ke Grup Ini' : 'Lihat Form Pendaftaran'}</span>
                        <ChevronRight className={`h-4 w-4 transition-transform ${isAvailable ? 'group-hover/btn:translate-x-1' : ''}`} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>



        {/* How It Works Section */}
        <section className="relative overflow-hidden bg-pine py-16 dark:bg-stone-900 sm:py-20">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(214,170,95,0.15),transparent_50%)]" />
            <div className="absolute right-0 bottom-0 h-full w-full bg-[radial-gradient(circle_at_70%_80%,rgba(58,107,84,0.2),transparent_50%)]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="section-heading-animate mb-12 text-center sm:mb-16">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-gold">Cara Kerja</p>
              <h2 className="font-serif-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Alur pendaftaran yang singkat dan jelas
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
                Pengunjung cukup cek slot, isi data, lalu panitia menindaklanjuti tanpa proses yang bertele-tele.
              </p>
            </div>

            <div className="relative grid gap-6 lg:grid-cols-3 lg:gap-8">
              <div className="timeline-flow-rail absolute bottom-[7.25rem] left-4 top-[7.25rem] hidden w-[4px] rounded-full bg-gradient-to-b from-gold via-gold/75 to-white/25 shadow-[0_0_18px_rgba(214,170,95,0.28)] sm:block lg:hidden" />
              <div className="timeline-flow-rail absolute bottom-[7.25rem] left-4 top-[7.25rem] w-[4px] rounded-full bg-gradient-to-b from-gold via-gold/75 to-white/25 shadow-[0_0_18px_rgba(214,170,95,0.28)] sm:hidden lg:hidden" />
              {[
                {
                  step: '01',
                  icon: CheckCircle2,
                  title: 'Cek Slot Real-Time',
                  description: 'Mulai dari daftar grup yang tersedia agar Anda langsung tahu pilihan yang masih bisa diambil.',
                  color: 'from-gold/20 to-gold/5',
                  iconColor: 'text-gold',
                },
                {
                  step: '02',
                  icon: Users,
                  title: 'Isi Formulir Mandiri',
                  description: 'Pilih grup, isi data peserta, lalu sistem membantu menjaga kapasitas grup tetap sesuai.',
                  color: 'from-palm/30 to-palm/10',
                  iconColor: 'text-palm',
                },
                {
                  step: '03',
                  icon: Sparkles,
                  title: 'Panitia Follow Up',
                  description: 'Setelah masuk, panitia tinggal memantau progres, pembayaran, dan grup prioritas dari dashboard.',
                  color: 'from-white/10 to-white/5',
                  iconColor: 'text-white',
                },
              ].map((item, index) => (
                <div key={item.step} className="relative h-full pl-10 lg:pl-0">
                  <div className="absolute left-[0.18rem] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold/70 bg-pine shadow-[0_0_0_8px_rgba(21,54,41,0.32)] lg:hidden">
                    <div className="h-3 w-3 rounded-full bg-gold shadow-[0_0_10px_rgba(214,170,95,0.45)]" />
                  </div>

                  <div
                    className="step-card group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-8"
                    style={{
                      background: `linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`,
                    }}
                  >
                    <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${item.color} opacity-0 blur-3xl transition-opacity group-hover:opacity-100`} />
                    
                    <div className="relative flex h-full flex-col">
                      <div className="mb-6 flex items-center justify-between">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm`}>
                          <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                        </div>
                        <span className="font-serif-display text-5xl font-bold text-white/10">{item.step}</span>
                      </div>
 
                      <h3 className="mb-3 text-xl font-bold text-white">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-white/70">{item.description}</p>
                    </div>
 
                    {index < 2 && (
                      <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 lg:block">
                        <ArrowRight className="h-6 w-6 text-white/20" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/register"
                className="cta-animate group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-pine shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Mulai Pendaftaran
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="section-heading-animate overflow-hidden rounded-[32px] border border-stone-200/80 bg-white/85 p-6 shadow-soft backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Siap Mendaftar</p>
                <h2 className="font-serif-display text-3xl font-bold text-pine dark:text-stone-100 sm:text-4xl">Pilih grup yang cocok lalu amankan slot Anda hari ini</h2>
                <p className="max-w-2xl text-sm leading-7 text-stone-600 dark:text-stone-300 sm:text-base">
                  Semua status grup tetap terlihat secara terbuka. Jika sudah menentukan pilihan, lanjutkan ke formulir pendaftaran agar panitia bisa segera memproses partisipasi Anda.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/register" className="button-primary group gap-2 px-6 py-3.5">
                  Daftar Sekarang
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="#slot-tersedia" className="button-secondary gap-2 px-6 py-3.5">
                  Lihat Slot Tersedia
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </HomeAnimations>
  );
}
