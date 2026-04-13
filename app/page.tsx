import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Users, CheckCircle2, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';

import { AutoRefresh } from '@/components/auto-refresh';
import { SectionHeading } from '@/components/section-heading';
import { StatusBadge } from '@/components/status-badge';
import { HomeAnimations } from '@/components/animations/home-animations';
import { getPublicData } from '@/lib/services/qurban-service';
import { formatCurrency, getOccupancyProgress } from '@/lib/utils';
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

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="grid items-center gap-7 sm:gap-9 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
              <div className="hero-animate order-2 flex flex-col justify-center space-y-4 sm:order-none sm:space-y-6 lg:space-y-8">
                <div className="hero-animate inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-medium text-pine dark:border-gold/20 dark:bg-gold/10 dark:text-gold sm:px-4 sm:py-2 sm:text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span className="break-words">Transparansi Slot Kurban {mosque.campaignYear}</span>
                </div>

                <div className="space-y-3 sm:space-y-5">
                  <h1 className="hero-animate max-w-5xl font-serif-display text-[2.15rem] font-semibold leading-[1.04] tracking-[-0.04em] text-pine dark:text-stone-100 sm:text-[3.35rem] lg:text-[4.15rem]">
                    Wujudkan niat kurban{' '}
                    <span className="relative inline-flex text-palm">
                      <span className="relative z-10">dengan lebih mudah</span>
                      <span className="absolute bottom-0 left-0 right-0 h-[0.42em] rounded-[999px] bg-gradient-to-r from-gold/0 via-gold/28 to-gold/0 dark:via-gold/18" />
                    </span>
                  </h1>
                  <p className="hero-animate max-w-2xl text-[0.96rem] leading-6 text-stone-600 dark:text-stone-300 sm:text-[1.06rem] sm:leading-8">
                    Jamaah dapat melihat ketersediaan grup secara real-time, memilih patungan yang sesuai, lalu mendaftar dengan alur yang ringkas dan mudah dipahami.
                  </p>
                </div>

                <div className="hero-animate flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-4">
                  <Link
                    href="/register"
                    className="cta-animate button-primary group w-full justify-center gap-2 px-6 py-3.5 sm:w-auto sm:px-7 sm:py-4"
                  >
                    Daftar Sekarang
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="#slot-tersedia"
                    className="cta-animate button-secondary w-full justify-center gap-2 px-6 py-3.5 sm:w-auto sm:px-7 sm:py-4"
                  >
                    Lihat Slot Tersedia
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="hero-animate grid grid-cols-3 gap-2.5 sm:gap-3">
                  <div className="rounded-[18px] border border-white/70 bg-white/80 px-3 py-3 backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-900/70 sm:rounded-[22px] sm:px-4 sm:py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400 sm:text-xs sm:tracking-[0.18em]">Slot Tersedia</p>
                    <p className="mt-1.5 text-2xl font-bold text-pine dark:text-stone-100 sm:mt-2 sm:text-3xl">{metrics.availableSlots}</p>
                    <p className="mt-1 text-[11px] leading-4 text-stone-500 dark:text-stone-400 sm:text-sm sm:leading-5">Masih bisa dipilih sekarang</p>
                  </div>
                  <div className="rounded-[18px] border border-white/70 bg-white/80 px-3 py-3 backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-900/70 sm:rounded-[22px] sm:px-4 sm:py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400 sm:text-xs sm:tracking-[0.18em]">Grup Prioritas</p>
                    <p className="mt-1.5 text-2xl font-bold text-ember sm:mt-2 sm:text-3xl">{metrics.urgentGroups}</p>
                    <p className="mt-1 text-[11px] leading-4 text-stone-500 dark:text-stone-400 sm:text-sm sm:leading-5">Tinggal 1-2 slot lagi</p>
                  </div>
                  <div className="rounded-[18px] border border-white/70 bg-white/80 px-3 py-3 backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-900/70 sm:rounded-[22px] sm:px-4 sm:py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400 sm:text-xs sm:tracking-[0.18em]">Peserta Masuk</p>
                    <p className="mt-1.5 text-2xl font-bold text-pine dark:text-stone-100 sm:mt-2 sm:text-3xl">{metrics.totalParticipants}</p>
                    <p className="mt-1 text-[11px] leading-4 text-stone-500 dark:text-stone-400 sm:text-sm sm:leading-5">Update otomatis dari formulir</p>
                  </div>
                </div>

                <div className="hero-animate flex flex-col gap-2.5 border-t border-stone-200/80 pt-4 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-300 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-5">
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

              <div className="hero-animate order-1 relative flex items-center justify-center px-2 sm:order-none sm:px-4 lg:justify-end lg:px-0">
                <div className="relative w-full max-w-[320px] sm:max-w-[460px] lg:max-w-[680px]">
                  <div className="pointer-events-none absolute -left-4 right-0 top-7 h-[66%] rounded-full bg-gradient-to-br from-pine/10 via-palm/6 to-gold/10 blur-2xl sm:-left-8 sm:right-2 sm:top-10 sm:h-[72%] sm:blur-3xl dark:from-pine/16 dark:via-palm/10 dark:to-gold/8" />
                  <div className="pointer-events-none absolute inset-x-[14%] top-[14%] h-[48%] rounded-full bg-gradient-to-b from-sand/18 via-sand/8 to-transparent blur-xl sm:inset-x-[12%] sm:top-[12%] sm:h-[56%] sm:blur-2xl dark:from-stone-900/12 dark:via-stone-900/6 dark:to-transparent" />
                  <div className="pointer-events-none absolute -bottom-4 left-8 right-8 h-10 rounded-full bg-pine/8 blur-xl sm:-bottom-6 sm:left-12 sm:right-12 sm:h-16 sm:blur-2xl dark:bg-black/18" />
                  <Image
                    src="/img/hero.webp"
                    alt="Ilustrasi patungan kurban"
                    width={1200}
                    height={1000}
                    priority
                    className="relative z-10 h-auto max-h-[260px] w-full object-contain brightness-[0.76] contrast-[1.01] saturate-[0.86] sepia-[0.03] drop-shadow-[0_16px_28px_rgba(21,54,41,0.1)] sm:max-h-none sm:object-cover sm:drop-shadow-[0_22px_44px_rgba(21,54,41,0.1)] dark:brightness-[0.74] dark:contrast-[1.03] dark:saturate-[0.84] dark:sepia-[0.05] dark:drop-shadow-[0_16px_28px_rgba(0,0,0,0.24)] dark:sm:drop-shadow-[0_22px_44px_rgba(0,0,0,0.24)]"
                  />
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
              const occupancy = getOccupancyProgress(group.filledSlots, group.capacity);
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
                          style={{ width: `${occupancy.percent}%` }}
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
                        <span className="font-semibold text-stone-700 dark:text-stone-200">{occupancy.label}</span>
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
