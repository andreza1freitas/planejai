import { ArrowUpRight, Goal, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/shared/Button'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { parseCurrency } from '@/utils/currency'
import { calcMonthlySavings } from '@/utils/simulation'

function formatMoney(value: string) {
  return parseCurrency(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDeadline(value: string) {
  const deadline = Number(value)

  if (!Number.isFinite(deadline)) {
    return value
  }

  return `${deadline} ${deadline === 1 ? 'mês' : 'meses'}`
}

function formatCreatedAt(value?: string) {
  if (!value) {
    return 'Data não disponível'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground/80 text-xs font-semibold tracking-[0.08em] uppercase">
        {label}
      </p>
      <p className="text-foreground text-base font-semibold sm:text-lg">
        {value}
      </p>
    </div>
  )
}

export function SimulationHistoryPage() {
  const navigate = useNavigate()
  const { deleteSimulation, getAllFormData } = useSimulationStorage()
  const [records, setRecords] = useState(() => getAllFormData())
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const orderedRecords = useMemo(() => {
    return [...records].sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0
      const rightTime = right.createdAt
        ? new Date(right.createdAt).getTime()
        : 0

      return rightTime - leftTime
    })
  }, [records])

  const totalSavings = orderedRecords.reduce(
    (sum, record) => sum + calcMonthlySavings(record),
    0,
  )

  const pendingDeleteRecord = orderedRecords.find(
    (record) => record.id === pendingDeleteId,
  )

  useEffect(() => {
    if (!pendingDeleteId) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setPendingDeleteId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [pendingDeleteId])

  function confirmDelete(id: string) {
    deleteSimulation(id)
    setRecords((current) => current.filter((record) => record.id !== id))
    setPendingDeleteId(null)
  }

  function handleDelete(id: string) {
    setPendingDeleteId(id)
  }

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(146,92,240,0.16),_transparent_55%)]" />

      <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 space-y-3 sm:mb-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Histórico de simulações
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
            Acompanhe o histórico dos seus planos financeiros e revise os
            resultados sempre que precisar.
          </p>
        </div>

        <div className="border-border/70 bg-card/70 mb-5 flex flex-col gap-3 rounded-3xl border px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground/80 text-xs font-semibold tracking-[0.12em] uppercase">
              Simulações salvas
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {orderedRecords.length}
            </p>
          </div>

          <div className="text-muted-foreground flex flex-col gap-2 text-sm sm:items-end">
            <span>
              Economia mensal acumulada:{' '}
              <strong className="text-foreground">
                R${' '}
                {totalSavings.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => void navigate('/')}
              className="text-primary inline-flex items-center gap-2 self-start font-medium transition hover:opacity-80 sm:self-end"
            >
              <Plus className="h-4 w-4" />
              Nova simulação
            </button>
          </div>
        </div>

        {orderedRecords.length === 0 ? (
          <div className="border-border/80 bg-card/70 rounded-[28px] border border-dashed px-6 py-14 text-center shadow-[0_24px_80px_-52px_rgba(15,23,42,0.35)]">
            <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
              <Goal className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold">
              Nenhuma simulação salva ainda
            </h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
              Crie uma nova simulação para ver seu histórico aparecer aqui com
              resumo, prazo e economia mensal.
            </p>
            <Button
              variant="secondary"
              icon={Plus}
              className="mx-auto mt-6 rounded-full px-5"
              onClick={() => void navigate('/')}
            >
              Criar simulação
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {orderedRecords.map((record) => {
              const monthlySavings = calcMonthlySavings(record)

              return (
                <li key={record.id}>
                  <article className="border-border/80 bg-card/95 rounded-[28px] border px-5 py-5 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_90px_-50px_rgba(15,23,42,0.45)] sm:px-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6">
                      <div className="flex items-center gap-4 lg:min-w-[14rem] lg:flex-none">
                        <div className="bg-primary/12 text-primary flex h-11 w-11 items-center justify-center rounded-2xl">
                          <Goal className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold">
                            {record.goalName}
                          </h2>
                          <p className="text-muted-foreground text-sm">
                            {formatCreatedAt(record.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="grid flex-1 gap-4 sm:grid-cols-3">
                        <Metric
                          label="Custo da meta"
                          value={`R$ ${formatMoney(record.goalAmount)}`}
                        />
                        <Metric
                          label="Prazo"
                          value={formatDeadline(record.goalDeadline)}
                        />
                        <Metric
                          label="Economia mensal"
                          value={`R$ ${monthlySavings.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`}
                        />
                      </div>

                      <div className="border-border/70 flex items-center justify-between gap-3 border-t pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
                        <button
                          type="button"
                          aria-label={`Excluir simulação ${record.goalName}`}
                          onClick={() => handleDelete(record.id)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-red-500 transition hover:bg-red-500/10"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

                        <Button
                          variant="secondary"
                          icon={ArrowUpRight}
                          className="h-11 rounded-full px-5"
                          onClick={() =>
                            void navigate(`/resultado/${record.id}`)
                          }
                        >
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {pendingDeleteRecord ? (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onClick={() => setPendingDeleteId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-history-title"
            aria-describedby="delete-history-description"
            className="border-border/80 bg-card text-foreground w-full max-w-md rounded-[28px] border p-6 shadow-[0_32px_120px_-40px_rgba(15,23,42,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                <Trash2 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 id="delete-history-title" className="text-xl font-semibold">
                  Excluir simulação?
                </h2>
                <p
                  id="delete-history-description"
                  className="text-muted-foreground mt-2 text-sm leading-6"
                >
                  Você quer remover{' '}
                  <strong>{pendingDeleteRecord.goalName}</strong> do histórico?
                  Essa ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="border-border/70 mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                className="rounded-full px-5"
                onClick={() => setPendingDeleteId(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="rounded-full px-5"
                onClick={() => confirmDelete(pendingDeleteRecord.id)}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
