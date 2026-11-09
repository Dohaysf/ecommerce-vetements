
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/orderStatus";
import Link from "next/link";

export const dynamic = "force-dynamic";

const REVENUE_STATUSES = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

type IconName =
  | "package"
  | "bag"
  | "users"
  | "chart"
  | "plus"
  | "arrow"
  | "calendar"
  | "sparkles"
  | "coins"
  | "clock"
  | "external"
  | "check";

const money = (value: number) =>
  value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });

const formatNumber = (value: number) =>
  value.toLocaleString("fr-FR");

function getChange(current: number, previous: number) {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {name === "package" && (
        <>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="M3 8v9l9 5 9-5V8" />
          <path d="M12 13v9" />
        </>
      )}

      {name === "bag" && (
        <>
          <path d="M5 8h14l1 13H4L5 8Z" />
          <path d="M9 9V6a3 3 0 0 1 6 0v3" />
        </>
      )}

      {name === "users" && (
        <>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20v-2a6.5 6.5 0 0 1 13 0v2z" />
          <path d="M16 5.5a3.5 3.5 0 0 1 0 6.5" />
          <path d="M18 14a5 5 0 0 1 3.5 4.8V20h-4" />
        </>
      )}

      {name === "chart" && (
        <>
          <path d="M4 20V11h4v9" />
          <path d="M10 20V5h4v15" />
          <path d="M16 20v-8h4v8" />
        </>
      )}

      {name === "plus" && (
        <>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </>
      )}

      {name === "arrow" && (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      )}

      {name === "external" && (
        <>
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </>
      )}

      {name === "calendar" && (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M7 3v4M17 3v4M3 10h18" />
        </>
      )}

      {name === "sparkles" && (
        <>
          <path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z" />
        </>
      )}

      {name === "coins" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5a4 4 0 1 0 0 7" />
          <path d="M7.5 11h6M7.5 13.5h6" />
        </>
      )}

      {name === "clock" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}

      {name === "check" && (
        <path d="m5 12 4 4L19 6" />
      )}
    </svg>
  );
}

/* TITRE DE SECTION */

function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-7 bg-[#C4A17C]" />
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#A16A78]">
            {eyebrow}
          </p>
        </div>

        <h2 className="font-[family-name:var(--font-display)] text-[29px] leading-tight tracking-tight text-[#39292D] sm:text-[35px]">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-[12px] leading-6 text-[#A0938B]">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

/* BADGE D'EVOLUTION */

function ChangeBadge({
  value,
}: {
  value: number | null;
}) {
  if (value === null || !Number.isFinite(value)) {
    return (
      <span className="text-[10px] text-[#A3948D]">
        —
      </span>
    );
  }

  const positive = value >= 0;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
        positive ? "text-[#428663]" : "text-[#B45D66]"
      }`}
    >
      {positive ? "↗" : "↘"}
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

/* MINI GRAPHIQUE */

function Sparkline({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  const points = values.map((value, index) => {
    const x =
      (index / Math.max(values.length - 1, 1)) * 140;

    const y =
      39 - ((value - min) / range) * 29;

    return `${x},${y}`;
  });

  const line = points.join(" ");
  const area = `0,45 ${line} 140,45`;

  return (
    <svg
      viewBox="0 0 140 46"
      className="h-12 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon
        points={area}
        fill={color}
        opacity=".09"
      />

      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* CARTE STATISTIQUE */

function StatCard({
  label,
  value,
  description,
  icon,
  color,
  background,
  values,
  change,
  href,
}: {
  label: string;
  value: string;
  description: string;
  icon: IconName;
  color: string;
  background: string;
  values: number[];
  change?: number | null;
  href?: string;
}) {
  return (
    <article
      className="group relative flex min-h-[240px] flex-col overflow-hidden rounded-[20px] border border-[#ECE3DE] p-5 shadow-[0_8px_28px_rgba(62,34,43,0.035)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(62,34,43,0.09)]"
      style={{ background }}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/60 transition-transform duration-500 group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/65"
          style={{ color }}
        >
          <Icon name={icon} size={24} />
        </div>

        {change !== undefined && (
          <ChangeBadge value={change} />
        )}
      </div>

      <p className="relative mt-5 text-[11px] font-semibold text-[#6D5558]">
        {label}
      </p>

      <p className="relative mt-1 break-words font-[family-name:var(--font-display)] text-[32px] leading-tight tracking-tight text-[#35262A] sm:text-[35px]">
        {value}
      </p>

      <p className="relative mt-1 text-[10px] text-[#94827D]">
        {description}
      </p>

      <div className="relative mt-auto pt-4">
        <Sparkline values={values} color={color} />

        <div className="mt-2 flex items-center justify-between border-t border-[#D9C9C3]/40 pt-3">
          <span className="text-[10px] text-[#9B8580]">
            Activité récente
          </span>

          {href ? (
            <Link
              href={href}
              aria-label={`Voir ${label}`}
              className="flex items-center gap-1 text-[10px] font-semibold transition hover:opacity-60"
              style={{ color }}
            >
              Consulter
              <Icon name="arrow" size={13} />
            </Link>
          ) : (
            <span
              style={{ color }}
              className="text-sm"
            >
              ✧
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/* GRAPHIQUE CHIFFRE D'AFFAIRES */

function RevenueChart({
  values,
}: {
  values: number[];
}) {
  const width = 700;
  const height = 230;
  const left = 15;
  const right = 15;
  const top = 20;
  const bottom = 28;

  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const max = Math.max(...values, 1) * 1.15;

  const coordinates = values.map((value, index) => ({
    x:
      left +
      (index / Math.max(values.length - 1, 1)) *
        chartWidth,
    y:
      top +
      chartHeight -
      (value / max) * chartHeight,
  }));

  const line = coordinates
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const area = `${line} L ${
    left + chartWidth
  } ${top + chartHeight} L ${left} ${
    top + chartHeight
  } Z`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Évolution du chiffre d'affaires sur les sept derniers jours"
      >
        <defs>
          <linearGradient
            id="adminRevenueFill"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#9C5063"
              stopOpacity=".25"
            />
            <stop
              offset="100%"
              stopColor="#9C5063"
              stopOpacity=".01"
            />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map(
          (ratio) => {
            const y = top + chartHeight * ratio;

            return (
              <line
                key={ratio}
                x1={left}
                y1={y}
                x2={width - right}
                y2={y}
                stroke="#EEE7E3"
                strokeDasharray="4 5"
              />
            );
          }
        )}

        <path
          d={area}
          fill="url(#adminRevenueFill)"
        />

        <path
          d={line}
          fill="none"
          stroke="#873C51"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coordinates.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={
              index === coordinates.length - 1
                ? 5
                : 3
            }
            fill="#873C51"
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>

      <div className="mt-1 grid grid-cols-7 gap-1 text-center">
        {[
          "J-6",
          "J-5",
          "J-4",
          "J-3",
          "J-2",
          "Hier",
          "Auj.",
        ].map((day) => (
          <span
            key={day}
            className="text-[10px] text-[#A0928A]"
          >
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}

/* GRAPHIQUE CIRCULAIRE */

function DonutChart({
  data,
}: {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
}) {
  const total = data.reduce(
    (sum, item) => sum + item.value,
    0
  );

  let accumulated = 0;

  const gradient =
    total === 0
      ? "#EEE7E2 0% 100%"
      : data
          .filter((item) => item.value > 0)
          .map((item) => {
            const start =
              (accumulated / total) * 100;

            accumulated += item.value;

            const end =
              (accumulated / total) * 100;

            return `${item.color} ${start}% ${end}%`;
          })
          .join(", ");

  return (
    <div className="flex flex-col items-center gap-7 sm:flex-row">
      <div
        className="relative h-[175px] w-[175px] shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${gradient})`,
        }}
      >
        <div className="absolute inset-[30px] flex flex-col items-center justify-center rounded-full bg-white">
          <span className="font-[family-name:var(--font-display)] text-[31px] text-[#402A30]">
            {formatNumber(total)}
          </span>

          <span className="text-[10px] text-[#A0928A]">
            commandes
          </span>
        </div>
      </div>

      <div className="w-full flex-1 space-y-4">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  background: item.color,
                }}
              />

              <span className="truncate text-[11px] text-[#79696A]">
                {item.label}
              </span>
            </div>

            <span className="text-[11px] font-semibold text-[#493339]">
              {total > 0
                ? `${Math.round(
                    (item.value / total) * 100
                  )}%`
                : "0%"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ACCÈS RAPIDES */

function ActionCard({
  href,
  title,
  description,
  icon,
  number,
  featured = false,
}: {
  href: string;
  title: string;
  description: string;
  icon: IconName;
  number: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-[20px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(75,46,46,0.1)] ${
        featured
          ? "border-[#793B4D] bg-gradient-to-br from-[#864559] to-[#5C2C3C] text-white"
          : "border-[#ECE3DD] bg-white text-[#3D2A30] hover:border-[#CDAF9F]"
      }`}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-current opacity-10 transition-transform duration-500 group-hover:scale-125" />

      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            featured
              ? "bg-white/15 text-[#F1D3B9]"
              : "bg-[#F8EBEE] text-[#914B5E]"
          }`}
        >
          <Icon name={icon} size={23} />
        </div>

        <span
          className={`font-[family-name:var(--font-display)] text-3xl italic ${
            featured
              ? "text-white/30"
              : "text-[#E5D4CD]"
          }`}
        >
          {number}
        </span>
      </div>

      <div className="relative mt-6">
        <h3 className="font-[family-name:var(--font-display)] text-[24px]">
          {title}
        </h3>

        <p
          className={`mt-2 text-[11px] leading-6 ${
            featured
              ? "text-white/65"
              : "text-[#A09289]"
          }`}
        >
          {description}
        </p>

        <div
          className={`mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] ${
            featured
              ? "text-[#F0D0B5]"
              : "text-[#8C4A5D]"
          }`}
        >
          Découvrir

          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* PAGE ADMIN */

export default async function AdminDashboard() {
  const now = new Date();

  const startToday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );

  const start7Days = new Date(startToday);
  start7Days.setUTCDate(
    start7Days.getUTCDate() - 6
  );

  const startPrevious7 = new Date(start7Days);
  startPrevious7.setUTCDate(
    startPrevious7.getUTCDate() - 7
  );

  const start30Days = new Date(startToday);
  start30Days.setUTCDate(
    start30Days.getUTCDate() - 29
  );

  const startPrevious30 = new Date(start30Days);
  startPrevious30.setUTCDate(
    startPrevious30.getUTCDate() - 30
  );

  const [
    productCount,
    orderCount,
    clientCount,
    revenue,
    recentOrders,
    allOrderStatuses,
    recentRevenueOrders,
    previousRevenueOrders,
    last7Orders,
    previous7OrderCount,
    recentProducts,
    previousProductCount,
    recentClients,
    previousClientCount,
  ] = await Promise.all([
    withRetry(() => prisma.product.count()),

    withRetry(() => prisma.order.count()),

    withRetry(() =>
      prisma.user.count({
        where: {
          role: "CLIENT",
        },
      })
    ),

    withRetry(() =>
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          status: {
            in: [...REVENUE_STATUSES],
          },
        },
      })
    ),

    withRetry(() =>
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      })
    ),

    withRetry(() =>
      prisma.order.groupBy({
        by: ["status"],
        _count: {
          _all: true,
        },
      })
    ),

    withRetry(() =>
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: start30Days,
          },
          status: {
            in: [...REVENUE_STATUSES],
          },
        },
        select: {
          total: true,
          createdAt: true,
        },
      })
    ),

    withRetry(() =>
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          createdAt: {
            gte: startPrevious30,
            lt: start30Days,
          },
          status: {
            in: [...REVENUE_STATUSES],
          },
        },
      })
    ),

    withRetry(() =>
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: start7Days,
          },
        },
        select: {
          createdAt: true,
        },
      })
    ),

    withRetry(() =>
      prisma.order.count({
        where: {
          createdAt: {
            gte: startPrevious7,
            lt: start7Days,
          },
        },
      })
    ),

    withRetry(() =>
      prisma.product.findMany({
        where: {
          createdAt: {
            gte: start7Days,
          },
        },
        select: {
          createdAt: true,
        },
      })
    ),

    withRetry(() =>
      prisma.product.count({
        where: {
          createdAt: {
            gte: startPrevious7,
            lt: start7Days,
          },
        },
      })
    ),

    withRetry(() =>
      prisma.user.findMany({
        where: {
          role: "CLIENT",
          createdAt: {
            gte: start7Days,
          },
        },
        select: {
          createdAt: true,
        },
      })
    ),

    withRetry(() =>
      prisma.user.count({
        where: {
          role: "CLIENT",
          createdAt: {
            gte: startPrevious7,
            lt: start7Days,
          },
        },
      })
    ),
  ]);

  const totalRevenue = Number(
    revenue._sum.total ?? 0
  );

  const revenue30 = recentRevenueOrders.reduce(
    (sum, order) =>
      sum + Number(order.total),
    0
  );

  const previousRevenue30 = Number(
    previousRevenueOrders._sum.total ?? 0
  );

  const revenueChange = getChange(
    revenue30,
    previousRevenue30
  );

  const ordersChange = getChange(
    last7Orders.length,
    previous7OrderCount
  );

  const productsChange = getChange(
    recentProducts.length,
    previousProductCount
  );

  const clientsChange = getChange(
    recentClients.length,
    previousClientCount
  );

  const dayKey = (date: Date) =>
    date.toISOString().slice(0, 10);

  const dayDates = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date(startToday);

      date.setUTCDate(
        date.getUTCDate() - (6 - index)
      );

      return date;
    }
  );

  const orderSpark = dayDates.map(
    (day) =>
      last7Orders.filter(
        (order) =>
          dayKey(order.createdAt) === dayKey(day)
      ).length
  );

  const productSpark = dayDates.map(
    (day) =>
      recentProducts.filter(
        (product) =>
          dayKey(product.createdAt) === dayKey(day)
      ).length
  );

  const clientSpark = dayDates.map(
    (day) =>
      recentClients.filter(
        (client) =>
          dayKey(client.createdAt) === dayKey(day)
      ).length
  );

  const revenueSpark = dayDates.map(
    (day) =>
      recentRevenueOrders
        .filter(
          (order) =>
            dayKey(order.createdAt) === dayKey(day)
        )
        .reduce(
          (sum, order) =>
            sum + Number(order.total),
          0
        )
  );

  const statusColors = [
    "#607D67",
    "#B48B59",
    "#D39C99",
    "#8E4257",
    "#D9BDA1",
    "#8293B4",
    "#9C8B9B",
  ];

  const statusData = allOrderStatuses.map(
    (item, index) => ({
      label:
        STATUS_LABELS[item.status] ??
        item.status,
      value: item._count._all,
      color:
        statusColors[
          index % statusColors.length
        ],
    })
  );

  const todayLabel = new Intl.DateTimeFormat(
    "fr-FR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(now);

  return (
    <main className="relative min-h-screen min-w-0 overflow-hidden bg-[#FAF8F5] text-[#39292D]">
      {/* FOND */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 95% 0%, #F3E5E3 0%, transparent 27%), radial-gradient(circle at 0% 85%, #F5ECE3 0%, transparent 30%)",
        }}
      />

      <div className="relative mx-auto max-w-[1600px] space-y-9 px-4 py-7 sm:px-7 lg:px-9 xl:px-10">
        {/* HEADER */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-[#C4A17C]" />

              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9C5B6B]">
                Douceur & Élégance
              </p>
            </div>

            <h1 className="font-[family-name:var(--font-display)] text-[38px] leading-tight tracking-tight text-[#39272D] sm:text-[48px]">
              Bonjour,{" "}
              <span className="italic text-[#98586B]">
                bienvenue.
              </span>
            </h1>

            <p className="mt-2 text-[12px] leading-6 text-[#A08D86]">
              Voici ce qui se passe dans votre boutique aujourd'hui.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl border border-[#EAE0DA] bg-white/85 px-5 py-3.5 shadow-[0_6px_22px_rgba(75,46,46,0.035)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#965369]">
              <Icon name="calendar" size={19} />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#A08E86]">
                Aujourd'hui
              </p>

              <p className="mt-1 text-[11px] font-semibold capitalize text-[#543B40]">
                {todayLabel}
              </p>
            </div>
          </div>
        </header>

        {/* HERO PREMIUM */}
        <section className="relative isolate min-h-[330px] overflow-hidden rounded-[24px] bg-[#F2E5DD] shadow-[0_14px_35px_rgba(77,43,49,0.07)]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFF9F5] via-[#F8ECE5] to-[#E5C8BB]" />

          <div className="absolute -right-20 -top-28 h-[400px] w-[400px] rounded-full bg-[#E3BFAE]/50 blur-3xl" />

          <div className="absolute right-[8%] top-[-70px] hidden h-[400px] w-[400px] rotate-12 rounded-[80px] border border-[#B88678]/20 lg:block" />

          <div className="absolute right-[12%] top-[-30px] hidden h-[330px] w-[330px] rotate-12 rounded-[70px] border border-[#B88678]/20 lg:block" />

          <div className="absolute bottom-[-110px] right-[5%] h-[290px] w-[290px] rounded-full bg-[#C89587]/20 blur-2xl" />

          <div className="relative z-10 flex min-h-[330px] items-center justify-between gap-8 px-7 py-10 sm:px-11 lg:px-12">
            <div className="max-w-[650px]">
              <div className="mb-5 flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#9A5365]">
                  Votre espace de gestion
                </span>

                <span className="h-px w-12 bg-[#C5A27C]" />
              </div>

              <h2 className="font-[family-name:var(--font-display)] text-[43px] italic leading-[1.08] tracking-tight text-[#4C2935] sm:text-[57px] xl:text-[68px]">
                Tableau de bord
              </h2>

              <p className="mt-5 max-w-[440px] text-[13px] leading-7 text-[#846B68]">
                Gérez votre boutique, suivez vos performances
                et faites grandir votre univers avec élégance.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/admin/produits/nouveau"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#76384B] px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_8px_20px_rgba(100,46,62,0.15)] transition hover:bg-[#552A39]"
                >
                  <Icon name="plus" size={16} />

                  Ajouter un produit

                  <span className="transition-transform group-hover:translate-x-1">
                    ↗
                  </span>
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-[#D8B8A8] bg-white/70 px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#773D4C] transition hover:bg-white"
                >
                  Voir la boutique

                  <Icon name="external" size={14} />
                </Link>
              </div>
            </div>

            {/* ELEMENT DECORATIF */}
            <div className="relative hidden h-[230px] w-[270px] shrink-0 items-center justify-center xl:flex">
              <div className="absolute h-[210px] w-[210px] rotate-12 rounded-[35px] border border-[#9F6B63]/30 bg-white/25 shadow-[0_20px_40px_rgba(104,61,61,0.06)]" />

              <div className="absolute h-[175px] w-[175px] -rotate-6 rounded-[25px] border border-white/70 bg-[#FFF8F2]/75 shadow-xl" />

              <div className="relative text-center">
                <p className="font-[family-name:var(--font-display)] text-[54px] italic text-[#8C4C5D]">
                  D&E
                </p>

                <span className="block text-[8px] uppercase tracking-[0.27em] text-[#A17C76]">
                  Douceur & Élégance
                </span>

                <span className="mt-3 block text-2xl text-[#B89168]">
                  ✧
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* STATISTIQUES */}
        <section>
          <SectionTitle
            eyebrow="01 / Vue d'ensemble"
            title="Votre boutique en chiffres"
            description="Une vision claire de votre activité."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Produits"
              value={formatNumber(productCount)}
              description="Articles dans votre catalogue"
              icon="package"
              color="#913E52"
              background="linear-gradient(135deg,#FFF7F7,#F9E8E9)"
              values={productSpark}
              change={productsChange}
              href="/admin/produits"
            />

            <StatCard
              label="Commandes"
              value={formatNumber(orderCount)}
              description="Commandes enregistrées"
              icon="bag"
              color="#AA7D44"
              background="linear-gradient(135deg,#FFFAF3,#F4E8D7)"
              values={orderSpark}
              change={ordersChange}
              href="/admin/commandes"
            />

            <StatCard
              label="Clients"
              value={formatNumber(clientCount)}
              description="Clients inscrits"
              icon="users"
              color="#5D7B67"
              background="linear-gradient(135deg,#F7FAF6,#E6EDE5)"
              values={clientSpark}
              change={clientsChange}
            />

            <StatCard
              label="Chiffre d'affaires"
              value={money(totalRevenue)}
              description="Commandes payées et suivantes"
              icon="coins"
              color="#913E52"
              background="linear-gradient(135deg,#FFF8F7,#F8E8EA)"
              values={revenueSpark}
              change={revenueChange}
            />
          </div>

          <p className="mt-3 text-[10px] leading-5 text-[#A3958E]">
            Évolution sur 7 jours pour les produits, commandes et clients ;
            sur 30 jours pour le chiffre d'affaires. Les tirets
            indiquent qu'aucune comparaison fiable n'est disponible.
          </p>
        </section>

        {/* ANALYSE */}
        <section>
          <SectionTitle
            eyebrow="02 / Performance"
            title="Analyse de votre activité"
            description="Comprenez vos ventes et le parcours de vos commandes."
          />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr]">
            {/* REVENUE */}
            <article className="min-w-0 rounded-[22px] border border-[#EDE4DE] bg-white p-6 shadow-[0_8px_28px_rgba(62,34,43,0.035)] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#914B5D]">
                      <Icon name="chart" size={20} />
                    </div>

                    <h3 className="font-[family-name:var(--font-display)] text-[23px] text-[#412D33]">
                      Chiffre d'affaires
                    </h3>
                  </div>

                  <p className="mt-5 font-[family-name:var(--font-display)] text-[34px] leading-tight text-[#412D33]">
                    {money(revenue30)}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <ChangeBadge value={revenueChange} />

                    <span className="text-[10px] text-[#A08F87]">
                      par rapport aux 30 jours précédents
                    </span>
                  </div>
                </div>

                <span className="rounded-full border border-[#EDE4DE] bg-[#FCFAF8] px-4 py-2 text-[10px] text-[#8F7C75]">
                  30 derniers jours
                </span>
              </div>

              <div className="mt-7">
                <RevenueChart values={revenueSpark} />
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-[#F0E9E4] pt-4">
                <span className="h-2 w-2 rounded-full bg-[#914B5D]" />

                <p className="text-[10px] text-[#A08F87]">
                  Évolution quotidienne des 7 derniers jours
                </p>
              </div>
            </article>

            {/* STATUTS */}
            <article className="min-w-0 rounded-[22px] border border-[#EDE4DE] bg-white p-6 shadow-[0_8px_28px_rgba(62,34,43,0.035)] sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6EEE4] text-[#B58B5B]">
                  <Icon name="bag" size={20} />
                </div>

                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-[23px] text-[#412D33]">
                    Répartition des commandes
                  </h3>

                  <p className="mt-1 text-[10px] text-[#A08F87]">
                    Selon leur statut actuel
                  </p>
                </div>
              </div>

              <div className="mt-9">
                <DonutChart data={statusData} />
              </div>

              <div className="mt-9 flex items-center justify-between border-t border-[#F0E9E4] pt-5">
                <div>
                  <p className="text-[10px] text-[#A08F87]">
                    Total des commandes
                  </p>

                  <p className="mt-1 font-[family-name:var(--font-display)] text-[25px] text-[#412D33]">
                    {formatNumber(orderCount)}
                  </p>
                </div>

                <Link
                  href="/admin/commandes"
                  aria-label="Voir les commandes"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8EDEF] text-[#914B5D] transition hover:bg-[#914B5D] hover:text-white"
                >
                  <Icon name="arrow" size={18} />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* COMMANDES RECENTES */}
        <section>
          <SectionTitle
            eyebrow="03 / Activité récente"
            title="Dernières commandes"
            description="Les cinq dernières commandes de votre boutique."
            action={
              <Link
                href="/admin/commandes"
                className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#8E4A5D]"
              >
                Toutes les commandes

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            }
          />

          <div className="overflow-hidden rounded-[22px] border border-[#EDE4DE] bg-white shadow-[0_8px_28px_rgba(62,34,43,0.035)]">
            <div className="flex items-center justify-between border-b border-[#F0E8E3] px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EDEF] text-[#914B5D]">
                  <Icon name="clock" size={20} />
                </div>

                <div>
                  <h3 className="text-[13px] font-semibold text-[#483239]">
                    Activité récente
                  </h3>

                  <p className="mt-1 text-[10px] text-[#A08F87]">
                    Suivi de vos ventes
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-[#F9F1ED] px-3 py-1.5 text-[10px] font-semibold text-[#9A6770]">
                {recentOrders.length} commande
                {recentOrders.length > 1 ? "s" : ""}
              </span>
            </div>

            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-20 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F9EEEC] text-[#A96D7D]">
                  <Icon name="bag" size={32} />
                </div>

                <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl italic text-[#50343D]">
                  Une belle histoire commence ici...
                </h3>

                <p className="mt-3 text-xs text-[#A08F87]">
                  Vos premières commandes apparaîtront ici.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[1.2fr_1.5fr_1fr_1.2fr_1fr_20px] gap-4 border-b border-[#F0E8E3] bg-[#FCF9F7] px-8 py-4 lg:grid">
                  {[
                    "Commande",
                    "Client",
                    "Date",
                    "Statut",
                    "Total",
                    "",
                  ].map((heading, index) => (
                    <span
                      key={index}
                      className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#A18E87]"
                    >
                      {heading}
                    </span>
                  ))}
                </div>

                <div className="divide-y divide-[#F2EBE6]">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/commandes/${order.id}`}
                      className="group grid grid-cols-1 gap-4 px-6 py-5 transition-colors hover:bg-[#FDF8F6] sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.2fr_1.5fr_1fr_1.2fr_1fr_20px] lg:items-center"
                    >
                      <div>
                        <p className="mb-1 text-[9px] uppercase tracking-wider text-[#A18E87] lg:hidden">
                          Commande
                        </p>

                        <span className="font-mono text-xs font-semibold text-[#8D475A]">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5E7E6] font-[family-name:var(--font-display)] text-base italic text-[#9C5364]">
                          {(order.user.name || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <div className="min-w-0">
                          <p className="mb-1 text-[9px] uppercase tracking-wider text-[#A18E87] lg:hidden">
                            Client
                          </p>

                          <p className="truncate text-[12px] font-semibold text-[#49343A]">
                            {order.user.name || "Client"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-[9px] uppercase tracking-wider text-[#A18E87] lg:hidden">
                          Date
                        </p>

                        <span className="text-[11px] text-[#907D78]">
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            timeZone: "UTC",
                          })}
                        </span>
                      </div>

                      <div>
                        <p className="mb-1 text-[9px] uppercase tracking-wider text-[#A18E87] lg:hidden">
                          Statut
                        </p>

                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.06em] ${
                            STATUS_STYLES[order.status]
                          }`}
                        >
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>

                      <div>
                        <p className="mb-1 text-[9px] uppercase tracking-wider text-[#A18E87] lg:hidden">
                          Total
                        </p>

                        <span className="text-[12px] font-semibold text-[#49343A]">
                          {money(Number(order.total))}
                        </span>
                      </div>

                      <span className="hidden text-[#C4A4A0] transition-transform group-hover:translate-x-1 lg:block">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}

            <div className="border-t border-[#F0E8E3] bg-[#FCF9F7] px-6 py-4 text-center">
              <Link
                href="/admin/commandes"
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#8D475A] hover:text-[#B48B59]"
              >
                Consulter toutes les commandes

                <Icon name="arrow" size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ACCES RAPIDES */}
        <section>
          <SectionTitle
            eyebrow="04 / Navigation"
            title="Votre espace de création"
            description="Les outils essentiels pour piloter votre boutique."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ActionCard
              href="/admin/produits"
              number="01"
              icon="package"
              title="Gérer les produits"
              description="Organisez votre collection et mettez en valeur chaque pièce."
            />

            <ActionCard
              href="/admin/commandes"
              number="02"
              icon="bag"
              title="Gérer les commandes"
              description="Accompagnez vos clients à chaque étape de leur commande."
            />

            <ActionCard
              href="/admin/produits/nouveau"
              number="03"
              icon="plus"
              title="Ajouter un produit"
              description="Enrichissez votre univers avec une nouvelle création."
              featured
            />
          </div>
        </section>

        {/* SIGNATURE */}
        <section className="relative overflow-hidden rounded-[22px] bg-gradient-to-r from-[#4A2633] via-[#71394A] to-[#A46C70] px-8 py-11 text-white sm:px-12">
          <div className="absolute -right-24 -top-28 h-[380px] w-[380px] rounded-full border border-[#F1D3B9]/20" />

          <div className="absolute -right-12 -top-16 h-[290px] w-[290px] rounded-full border border-[#F1D3B9]/20" />

          <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#EBC9AC]">
                Douceur & Élégance
              </span>

              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl italic leading-tight sm:text-4xl">
                Votre boutique.
                <br />
                Votre univers.
                <br />
                Votre réussite.
              </h2>

              <div className="mt-6 h-px w-16 bg-[#E6C19F]" />
            </div>

            <div className="max-w-xs">
              <p className="font-[family-name:var(--font-display)] text-2xl italic leading-9 text-[#F3DCC9]">
                L'élégance dans chaque détail.
              </p>

              <Link
                href="/"
                aria-label="Visiter la boutique"
                className="mt-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E9C7A8] text-[#F3DCC9] transition hover:bg-white hover:text-[#71394A]"
              >
                <Icon name="external" size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex flex-col justify-between gap-4 border-t border-[#EAE1DC] pb-4 pt-7 sm:flex-row sm:items-center">
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl italic text-[#854457]">
              Douceur & Élégance
            </p>

            <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#A5938B]">
              L'art de choisir avec élégance
            </p>
          </div>

          <p className="text-[10px] text-[#A5938B]">
            Espace administration · Gestion de la boutique
          </p>
        </footer>
      </div>
    </main>
  );
}
