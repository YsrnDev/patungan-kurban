'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, Search, ArrowRightLeft, Trash2, CreditCard, MapPin, Plus } from 'lucide-react';

import {
  deleteParticipantAction,
  moveParticipantAction,
  updatePaymentStatusAction,
} from '@/lib/actions';
import type { GroupWithStats, Participant, PaymentStatus } from '@/lib/types';
import { formatDate, paymentStatusLabel } from '@/lib/utils';
import { PaymentStatusBadge } from '@/components/dashboard/payment-status-badge';
import { EmptyState } from '@/components/dashboard/empty-state';

interface ParticipantsManagerProps {
  groups: GroupWithStats[];
  participants: Participant[];
}

const paymentFilters: Array<{ value: 'all' | PaymentStatus; label: string }> = [
  { value: 'all', label: 'Semua pembayaran' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'partial', label: 'DP' },
  { value: 'paid', label: 'Lunas' },
];

export function ParticipantsManager({ groups, participants }: ParticipantsManagerProps) {
  const [query, setQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all');

  const filteredParticipants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return participants.filter((participant) => {
      const group = groups.find((item) => item.id === participant.groupId);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        participant.fullName.toLowerCase().includes(normalizedQuery) ||
        participant.phone.toLowerCase().includes(normalizedQuery) ||
        participant.city.toLowerCase().includes(normalizedQuery) ||
        participant.notes.toLowerCase().includes(normalizedQuery) ||
        (group?.name.toLowerCase().includes(normalizedQuery) ?? false);

      const matchesPayment = paymentFilter === 'all' || participant.paymentStatus === paymentFilter;

      return matchesQuery && matchesPayment;
    });
  }, [groups, participants, paymentFilter, query]);

  const hasParticipants = participants.length > 0;
  const hasFilteredResults = filteredParticipants.length > 0;

  return (
    <div className="table-shell">
      <div className="table-toolbar">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="table-toolbar-title">
            <div className="table-toolbar-icon">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="section-eyebrow">Daftar Peserta</p>
              <h2 className="section-title mt-1">Kelola perpindahan dan pembayaran</h2>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contoh: Anwar, Sapi A, 0812, kuitansi"
              aria-label="Cari peserta"
              className="touch-target-lg"
            />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end lg:justify-end">
            <div className="sm:w-[220px]">
              <select
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value as 'all' | PaymentStatus)}
                aria-label="Filter pembayaran"
                className="touch-target-lg"
              >
                {paymentFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/dashboard/participants?modal=add"
              className="button-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Tambah Peserta
            </Link>
          </div>
        </div>
      </div>

      {hasParticipants ? (
        <>
          {hasFilteredResults ? (
            <>
              <div className="hidden lg:block">
                <div className="table-scroll">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Peserta</th>
                        <th>Grup</th>
                        <th>Pembayaran</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredParticipants.map((participant) => {
                        const group = groups.find((item) => item.id === participant.groupId);

                        return (
                          <tr key={participant.id}>
                            <td>
                              <p className="font-semibold text-pine dark:text-stone-100">{participant.fullName}</p>
                              <p className="mt-1 text-stone-600 dark:text-stone-300">{participant.phone}</p>
                              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{participant.city} - {formatDate(participant.registeredAt)}</p>
                            </td>
                            <td>
                              <p className="font-medium text-stone-700 dark:text-stone-200">{group?.name ?? '-'}</p>
                              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                {group ? `${group.filledSlots}/${group.capacity} slot terisi` : 'Tanpa grup'}
                              </p>
                              <p className="mt-2 text-xs leading-6 text-stone-500 dark:text-stone-400">{participant.notes || 'Tanpa catatan'}</p>
                            </td>
                            <td>
                              <div className="space-y-3">
                                <PaymentStatusBadge status={participant.paymentStatus} />
                                <form action={updatePaymentStatusAction} className="space-y-2">
                                  <input type="hidden" name="participantId" value={participant.id} />
                                  <select
                                    name="paymentStatus"
                                    defaultValue={participant.paymentStatus}
                                    className="text-sm py-2"
                                    onChange={(e) => e.currentTarget.form?.requestSubmit()}
                                  >
                                    <option value="pending">Menunggu</option>
                                    <option value="partial">DP</option>
                                    <option value="paid">Lunas</option>
                                  </select>
                                </form>
                              </div>
                            </td>
                            <td>
                              <div className="space-y-3">
                                <form action={moveParticipantAction} className="space-y-2">
                                  <input type="hidden" name="participantId" value={participant.id} />
                                  <label className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                                    <ArrowRightLeft className="h-3 w-3" />
                                    Pindah ke grup
                                  </label>
                                  <select
                                    name="targetGroupId"
                                    defaultValue={participant.groupId}
                                    className="text-sm py-2"
                                    onChange={(e) => e.currentTarget.form?.requestSubmit()}
                                  >
                                    {groups.map((groupItem) => (
                                      <option key={groupItem.id} value={groupItem.id}>
                                        {groupItem.name} ({groupItem.filledSlots}/{groupItem.capacity})
                                      </option>
                                    ))}
                                  </select>
                                </form>

                                <form action={deleteParticipantAction} className="pt-2 border-t border-[color:var(--line-soft)]">
                                  <input type="hidden" name="participantId" value={participant.id} />
                                  <button type="submit" className="flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800 dark:text-rose-300 dark:hover:text-rose-200">
                                    <Trash2 className="h-3 w-3" />
                                    Hapus peserta
                                  </button>
                                </form>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2 p-3 sm:p-4 lg:hidden">
                {filteredParticipants.map((participant) => {
                  const group = groups.find((item) => item.id === participant.groupId);

                  return (
                    <article key={participant.id} className="list-row list-row-compact space-y-2 px-3 py-2.5 sm:space-y-2.5 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-pine dark:text-stone-100">{participant.fullName}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                            <span>{participant.phone}</span>
                            <span>•</span>
                            <span>{formatDate(participant.registeredAt)}</span>
                          </div>
                        </div>
                        <PaymentStatusBadge status={participant.paymentStatus} />
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                        <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-1.5 py-0.5 dark:bg-stone-900/80">
                          <MapPin className="h-2.5 w-2.5" />
                          {participant.city}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-sand px-1.5 py-0.5 text-stone-600 dark:bg-stone-900/80 dark:text-stone-300">
                          {group?.name ?? 'Tanpa grup'}
                        </span>
                        {group && (
                          <span className="text-stone-400 dark:text-stone-500">
                            {group.filledSlots}/{group.capacity}
                          </span>
                        )}
                      </div>

                      {participant.notes ? (
                        <div className="rounded-lg border border-[color:var(--line-soft)]/60 bg-stone-50/50 px-2.5 py-1.5 text-[11px] leading-4 text-stone-600 dark:bg-stone-900/30 dark:text-stone-400">
                          <p className="line-clamp-1">{participant.notes}</p>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <form action={updatePaymentStatusAction} className="flex items-center gap-1.5">
                          <input type="hidden" name="participantId" value={participant.id} />
                          <CreditCard className="h-3 w-3 shrink-0 text-stone-400 dark:text-stone-500" />
                          <select
                            name="paymentStatus"
                            defaultValue={participant.paymentStatus}
                            className="mobile-card-inline-select"
                            onChange={(e) => e.currentTarget.form?.requestSubmit()}
                          >
                            <option value="pending">Tunggu</option>
                            <option value="partial">DP</option>
                            <option value="paid">Lunas</option>
                          </select>
                        </form>

                        <form action={moveParticipantAction} className="flex items-center gap-1.5">
                          <input type="hidden" name="participantId" value={participant.id} />
                          <ArrowRightLeft className="h-3 w-3 shrink-0 text-stone-400 dark:text-stone-500" />
                          <select
                            name="targetGroupId"
                            defaultValue={participant.groupId}
                            className="mobile-card-inline-select"
                            onChange={(e) => e.currentTarget.form?.requestSubmit()}
                          >
                            {groups.map((groupItem) => (
                              <option key={groupItem.id} value={groupItem.id}>
                                {groupItem.name}
                              </option>
                            ))}
                          </select>
                        </form>
                      </div>

                      <form action={deleteParticipantAction} className="flex justify-end pt-0.5">
                        <input type="hidden" name="participantId" value={participant.id} />
                        <button type="submit" className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-stone-400 transition hover:text-rose-600 dark:text-stone-500 dark:hover:text-rose-400">
                          <Trash2 className="h-3 w-3" />
                          Hapus
                        </button>
                      </form>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={Search}
                title="Tidak ada hasil"
                description={`Tidak ada peserta yang cocok dengan pencarian "${query}" atau filter pembayaran yang dipilih.`}
                action={{ label: 'Reset Filter', onClick: () => { setQuery(''); setPaymentFilter('all'); } }}
              />
            </div>
          )}
        </>
      ) : (
        <div className="p-5">
          <EmptyState
            icon={Users}
            title="Belum ada peserta"
            description="Peserta akan muncul di sini setelah mendaftar melalui form atau ditambahkan manual."
          />
        </div>
      )}
    </div>
  );
}
