import { readLegacyContext } from '@/features/financial-workspace/legacy-context';
import { AxiosHeaders, type AxiosAdapter } from 'axios';
import { PERMISSIONS } from '@/lib/constants/auth.constants';

const partnerId = 'zomato_driver_renewed';
const lob = 'health';
const productIds = ['group_health'];
const permissions = Object.values(PERMISSIONS);
const page = { currentPage: 1, pageSize: 15, totalRecords: 3, totalPages: 1, hasNext: false };
const now = '2026-10-17T05:12:00.000Z';
let savedOverview: unknown = null;

const envelope = (data: unknown, filters: Record<string, unknown> = {}) => ({
  data,
  meta: { filters, timestamp: now, traceId: 'local-demo', errors: [] },
});

const policies = [
  {
    policyId: 'demo-policy-001',
    policyNumber: 'ACKO/ZOM/2026/000184',
    status: 'ACTIVE',
    issuedOn: '2026-08-12T10:30:00Z',
    startDate: '2026-08-12T00:00:00Z',
    endDate: '2027-08-11T23:59:59Z',
    planDetails: { planId: 'zomato_health_plus', sumInsured: 500000 },
    premium: { amount: 12500 },
    persons: [
      {
        insured: {
          name: 'Aarav Sharma',
          phone: '9876543210',
          email: 'aarav@example.test',
          gender: 'Male',
          uhid: 'UHID-1001',
        },
        nominee: {
          name: 'Mira Sharma',
          phone: '9876543211',
          email: 'mira@example.test',
          dob: '1994-05-12',
        },
      },
    ],
    partnerIdentifiers: [{ field: 'employeeId', displayName: 'Employee ID', value: 'ZOM-10421' }],
  },
  {
    policyId: 'demo-policy-002',
    policyNumber: 'ACKO/ZOM/2026/000185',
    status: 'ACTIVE',
    issuedOn: '2026-08-18T09:10:00Z',
    startDate: '2026-08-18T00:00:00Z',
    endDate: '2027-08-17T23:59:59Z',
    planDetails: { planId: 'zomato_health_plus', sumInsured: 300000 },
    premium: { amount: 8900 },
    persons: [
      {
        insured: {
          name: 'Diya Patel',
          phone: '9876501234',
          email: 'diya@example.test',
          gender: 'Female',
          uhid: 'UHID-1002',
        },
      },
    ],
    partnerIdentifiers: [{ field: 'employeeId', displayName: 'Employee ID', value: 'ZOM-10422' }],
  },
  {
    policyId: 'demo-policy-003',
    policyNumber: 'ACKO/ZOM/2026/000186',
    status: 'EXPIRED',
    issuedOn: '2025-06-01T09:10:00Z',
    startDate: '2025-06-01T00:00:00Z',
    endDate: '2026-05-31T23:59:59Z',
    planDetails: { planId: 'zomato_health_basic', sumInsured: 200000 },
    premium: { amount: 6100 },
    persons: [
      {
        insured: {
          name: 'Kabir Mehta',
          phone: '9876512345',
          email: 'kabir@example.test',
          gender: 'Male',
          uhid: 'UHID-1003',
        },
      },
    ],
    partnerIdentifiers: [{ field: 'employeeId', displayName: 'Employee ID', value: 'ZOM-10423' }],
  },
];

const claims = [
  {
    createdOn: '2026-09-14T08:30:00Z',
    claimantName: 'Aarav Sharma',
    claimantPhone: '9876543210',
    claimRequestNumber: 'CLM-2026-004812',
    policyNumber: policies[0].policyNumber,
    planId: 'zomato_health_plus',
    coverId: 'hospitalisation',
    statusGroup: 'ONGOING',
    detailedStatus: 'Documents under review',
    fnolCompletedOn: '2026-09-14T08:30:00Z',
    claimUsers: {
      claimants: [
        {
          name: 'Aarav Sharma',
          email: 'aarav@example.test',
          phone: '9876543210',
          userId: 'UHID-1001',
          relationship: 'SELF',
        },
      ],
    },
    incidentDetails: {
      data: {
        hospital_name: 'City Care Hospital',
        hospital_pincode: '560001',
        is_listed_hospital: true,
        incident_date: '2026-09-12',
        hospitalization_date: { admit: '2026-09-12', discharge: '2026-09-14' },
        incident_description: 'In-patient treatment for acute appendicitis.',
      },
    },
    payments: [],
    policyEkey: 'demo-policy-001',
    statusTimeline: [],
  },
  {
    createdOn: '2026-09-08T11:10:00Z',
    claimantName: 'Diya Patel',
    claimantPhone: '9876501234',
    claimRequestNumber: 'CLM-2026-004733',
    policyNumber: policies[1].policyNumber,
    planId: 'zomato_health_plus',
    coverId: 'hospitalisation',
    statusGroup: 'paid',
    detailedStatus: 'Claim settled',
    fnolCompletedOn: '2026-09-08T11:10:00Z',
    claimUsers: {
      claimants: [
        {
          name: 'Diya Patel',
          email: 'diya@example.test',
          phone: '9876501234',
          userId: 'UHID-1002',
          relationship: 'SELF',
        },
      ],
    },
    incidentDetails: {
      data: {
        hospital_name: 'Green Valley Hospital',
        hospital_pincode: '400001',
        is_listed_hospital: true,
        incident_date: '2026-09-05',
        incident_description: 'Day care procedure.',
      },
    },
    payments: [
      {
        claimRequestNumber: 'CLM-2026-004733',
        amount: 24500,
        claimedAmount: 29000,
        status: 'PAID',
        mode: 'NEFT',
        utrNumber: 'DEMO-UTR-733',
      },
    ],
    policyEkey: 'demo-policy-002',
    statusTimeline: [],
  },
  {
    createdOn: '2026-08-28T14:45:00Z',
    claimantName: 'Kabir Mehta',
    claimantPhone: '9876512345',
    claimRequestNumber: 'CLM-2026-004502',
    policyNumber: policies[2].policyNumber,
    planId: 'zomato_health_basic',
    coverId: 'hospitalisation',
    statusGroup: 'REJECTED',
    detailedStatus: 'Insufficient policy waiting period',
    fnolCompletedOn: '2026-08-28T14:45:00Z',
    claimUsers: {
      claimants: [
        {
          name: 'Kabir Mehta',
          email: 'kabir@example.test',
          phone: '9876512345',
          userId: 'UHID-1003',
          relationship: 'SELF',
        },
      ],
    },
    incidentDetails: {
      data: {
        hospital_name: 'Metro Multispecialty',
        hospital_pincode: '110001',
        is_listed_hospital: false,
        incident_date: '2026-08-26',
        incident_description: 'Consultation and diagnostic tests.',
      },
    },
    payments: [],
    policyEkey: 'demo-policy-003',
    statusTimeline: [],
  },
];

const manualRefunds = [
  {
    id: 184,
    policyId: 1001,
    policyEkey: 'demo-policy-001',
    policyNumber: policies[0].policyNumber,
    partnerId,
    planId: 'zomato_health_plus',
    instrumentType: 'BANK',
    accountNumber: 'XXXXXX4120',
    ifsc: 'HDFC0000123',
    accountHolder: 'Aarav Sharma',
    bankName: 'HDFC Bank',
    refundAmount: 2450,
    refundSource: 'POLICY_CANCELLATION',
    status: 'initiated',
    utr: null,
    remark: 'Awaiting bank confirmation',
    priority: 'P1',
    refundDestination: 'customer',
    initiatedBy: { name: 'Riya Verma', email: 'ops@example.test' },
    createdOn: '2026-09-20T10:00:00Z',
    updatedOn: '2026-09-21T10:00:00Z',
  },
  {
    id: 183,
    policyId: 1002,
    policyEkey: 'demo-policy-002',
    policyNumber: policies[1].policyNumber,
    partnerId,
    planId: 'zomato_health_plus',
    instrumentType: 'UPI',
    vpa: 'diya@exampleupi',
    accountHolder: 'Diya Patel',
    refundAmount: 1250,
    refundSource: 'ENDORSEMENT',
    status: 'settled',
    utr: 'DEMO-UTR-183',
    remark: 'Refund processed',
    priority: 'P2',
    refundDestination: 'customer',
    initiatedBy: { name: 'Riya Verma', email: 'ops@example.test' },
    createdOn: '2026-09-17T10:00:00Z',
    updatedOn: '2026-09-18T10:00:00Z',
  },
  {
    id: 182,
    policyId: 1003,
    policyEkey: 'demo-policy-003',
    policyNumber: policies[2].policyNumber,
    partnerId,
    planId: 'zomato_health_basic',
    instrumentType: 'BANK',
    accountNumber: 'XXXXXX8841',
    ifsc: 'ICIC0000456',
    accountHolder: 'Kabir Mehta',
    bankName: 'ICICI Bank',
    refundAmount: 600,
    refundSource: 'PREMIUM_ADJUSTMENT',
    status: 'initiated',
    utr: null,
    remark: 'Bank details verified',
    priority: 'P3',
    refundDestination: 'partner',
    initiatedBy: { name: 'Riya Verma', email: 'ops@example.test' },
    createdOn: '2026-09-10T10:00:00Z',
    updatedOn: '2026-09-12T10:00:00Z',
  },
];

const communications = {
  communications: [
    {
      type: 'whatsapp',
      subject: 'Claim status update',
      date: '2026-09-15T09:00:00Z',
      status: 'success',
      source: 'ACKO',
      claim_number: claims[0].claimRequestNumber,
      target: '9876543210',
    },
    {
      type: 'mail',
      subject: 'Documents received',
      date: '2026-09-14T12:30:00Z',
      status: 'success',
      source: 'ACKO',
      claim_number: claims[0].claimRequestNumber,
      target: 'aarav@example.test',
    },
  ],
  pagination: page,
};

const respond = (config: Parameters<AxiosAdapter>[0], data: unknown, status = 200) => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Created',
  headers: new AxiosHeaders({ 'content-type': 'application/json' }),
  config,
});

export const localDemoAdapter: AxiosAdapter = async (config) => {
  const url = new URL(config.url ?? '/', config.baseURL ?? 'http://localhost');
  const path = url.pathname.replace(/\/$/, '');
  const method = (config.method ?? 'get').toLowerCase();
  const context = readLegacyContext();
  if (method !== 'get' && !path.includes('/overview/components/')) {
    if (path.endsWith('/overview/config') || path.endsWith('/configurations')) {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const data = body.overview_config || body;
      savedOverview = {
        source: 'LEDGER',
        partner_id: partnerId,
        user_id: 'local-demo-user',
        cards: [],
        kpis: data.kpis.map((r: { id: string; position: number }) => ({
          ...r,
          id: r.id.toLowerCase(),
        })),
        charts: data.charts.map((r: { id: string; position: number }) => ({
          ...r,
          id: r.id.toLowerCase(),
        })),
      };
      return respond(config, savedOverview);
    }
    throw new Error(
      'This existing operational action needs the connected backend. No change was made in the local preview.',
    );
  }
  const firstPolicy = policies[0];
  const firstClaim = claims[0];

  if (path === '/admin/partners' && method === 'get') {
    return respond(config, { partners: [{ id: partnerId, display_name: 'Zomato', permissions }] });
  }
  if (path === `/admin/partners/${partnerId}/lobs` && method === 'get') {
    return respond(config, {
      partner_id: partnerId,
      lobs: [{ id: lob, lob_group_id: lob, permissions }],
    });
  }
  if (path.endsWith('/products') && path.includes('/admin/partners/')) {
    return respond(config, {
      partner_id: partnerId,
      lob,
      products: [{ id: productIds[0], permissions }],
    });
  }
  if (path === '/user/profile') {
    return respond(config, {
      id: 'local-demo-user',
      enabled: true,
      realm: 'partner-portal',
      first_name: 'Nikhil',
      last_name: 'Demo',
      primary_credentials: [{ type: 'email', value: 'demo@example.test' }],
      created_on: now,
      updated_on: now,
    });
  }

  if (path.endsWith('/overview/config')) {
    if (savedOverview) return respond(config, savedOverview);
    const kpis = ['total_policies_issued', 'gross_written_premium', 'float_balance'].map(
      (id, position) => ({ id, position }),
    );
    const charts = [
      'gwp_policy_count_trend',
      'claims_trend_by_status',
      'avg_premium_trend',
      'average_si_trend',
      'geo_distribution_policies',
      'policies_by_tenure_distribution',
    ].map((id, position) => ({ id, position }));
    return respond(config, {
      source: 'LEDGER',
      partner_id: partnerId,
      user_id: 'local-demo-user',
      kpis,
      charts,
      cards: [],
    });
  }
  if (path.endsWith('/overview/cards')) return respond(config, []);
  if (path.endsWith('/coverages/plan-mapping')) {
    return respond(
      config,
      envelope(
        {
          coverage_mappings: [
            {
              plan_id: 'zomato_health_plus',
              cover_ids: ['hospitalization_ipd_fhpl', 'day_care', 'pre_hospitalisation'],
            },
            { plan_id: 'zomato_health_basic', cover_ids: ['hospitalization_ipd_fhpl'] },
          ],
        },
        { partnerId, productIds, lob },
      ),
    );
  }
  if (path.includes('/overview/components/')) {
    const pathParts = path.split('/');
    const type = pathParts[7];
    const id = pathParts[8].toLowerCase();
    if (type === 'KPI') {
      const values: Record<string, number> = {
        total_policies_issued: 1248,
        gross_written_premium: context
          ? -context.view.movements
              .filter((m) => ['premium', 'premium-adjustment', 'adjustment'].includes(m.kind))
              .reduce((n, m) => n + m.amount, 0) / 100
          : 0,
        float_balance: context
          ? context.view.balances.reduce((n, b) => n + b.available, 0) / 100
          : 0,
      };
      const verified =
        context?.snapshot.dataState === 'ready' &&
        context.snapshot.reconciliation === 'matched' &&
        context.view.actor.capabilities.includes('view');
      if (id !== 'total_policies_issued' && !verified)
        return respond(config, {
          componentId: id,
          componentType: 'kpi',
          label: id.replaceAll('_', ' '),
          payload: { type: 'kpi', status: 'UNAVAILABLE', value: null },
        });
      const label = id.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
      return respond(config, {
        componentId: id,
        componentType: 'kpi',
        label,
        payload: {
          type: 'kpi',
          status: 'AVAILABLE',
          value: values[id] ?? 520,
          currency: id === 'gross_written_premium' || id === 'float_balance' ? 'INR' : undefined,
        },
      });
    }
    const periods = ['2026-06', '2026-07', '2026-08', '2026-09'];
    const trend = periods.map((period, index) => ({
      period,
      periodType: 'MONTHLY',
      periodStart: `${period}-01`,
      periodEnd: `${period}-28`,
      gwp: {
        amount: 410000 + index * 52000,
        currency: 'INR',
        breakdown: {
          issuanceAmount: 400000 + index * 50000,
          endorsementAmount: 12000,
          cancellationAmount: 4000,
          refundAmount: 2000,
        },
      },
      metrics: {
        policyCount: 245 + index * 20,
        issuanceCount: 240 + index * 18,
        endorsementCount: 8,
        cancellationCount: 3,
        refundCount: 2,
      },
    }));
    const dataById: Record<string, unknown> = {
      gwp_policy_count_trend: {
        gwpTrend: trend,
        summary: {
          totalGwp: 1845200,
          averageGwp: 461300,
          totalPolicies: 1020,
          periodCount: 4,
          dateRange: {},
          peaks: {
            highest: { period: periods[3], gwp: 566000 },
            lowest: { period: periods[0], gwp: 410000 },
          },
          growth: { overallPercentage: 12.6, direction: 'UP' },
        },
      },
      claims_trend_by_status: {
        claimTrend: trend.map((item, index) => ({
          period: item.period,
          periodType: 'MONTHLY',
          periodStart: item.periodStart,
          periodEnd: item.periodEnd,
          claimsByStatus: [
            { status: 'ONGOING', count: 18 + index, percentage: 25 },
            { status: 'COMPLETED', count: 42 + index * 2, percentage: 60 },
            { status: 'REJECTED', count: 10, percentage: 15 },
          ],
          totalClaims: 70 + index * 3,
        })),
        summary: {
          totalClaims: 292,
          periodCount: 4,
          statusBreakdown: { ongoing: 74, completed: 176, rejected: 42, closed: 0 },
          averageClaimsPerPeriod: 73,
          peaks: {
            highest: { period: periods[3], count: 79 },
            lowest: { period: periods[0], count: 70 },
          },
          rates: { completionRate: 60, rejectionRate: 14, ongoingRate: 26 },
          dateRange: {},
        },
      },
      avg_premium_trend: {
        averagePremiumTrend: trend.map((item, i) => ({
          period: item.period,
          periodType: 'MONTHLY',
          periodStart: item.periodStart,
          periodEnd: item.periodEnd,
          averagePremium: { amount: 1650 + i * 80, currency: 'INR' },
          metrics: { policyCount: 245 + i * 20, premiumAmount: item.gwp.amount },
        })),
      },
      average_si_trend: {
        averageSiTrend: trend.map((item, i) => ({
          period: item.period,
          periodType: 'MONTHLY',
          periodStart: item.periodStart,
          periodEnd: item.periodEnd,
          averageSumInsured: { amount: 320000 + i * 12000, currency: 'INR' },
        })),
      },
      geo_distribution_policies: {
        geoDistribution: [
          {
            period: periods[3],
            periodType: 'MONTHLY',
            periodStart: `${periods[3]}-01`,
            periodEnd: `${periods[3]}-28`,
            totalPolicies: 1248,
            states: [
              { state: 'Maharashtra', stateCode: 'MH', policyCount: 385, percentage: 31 },
              { state: 'Karnataka', stateCode: 'KA', policyCount: 290, percentage: 23 },
              { state: 'Delhi', stateCode: 'DL', policyCount: 210, percentage: 17 },
            ],
          },
        ],
      },
      policies_by_tenure_distribution: {
        tenureDistribution: [
          {
            period: periods[3],
            periodType: 'MONTHLY',
            periodStart: `${periods[3]}-01`,
            periodEnd: `${periods[3]}-28`,
            buckets: [
              { min: 0, max: 3, policyCount: 250, percentage: 20 },
              { min: 4, max: 6, policyCount: 430, percentage: 34 },
              { min: 7, max: 12, policyCount: 568, percentage: 46 },
            ],
          },
        ],
      },
    };
    const labels: Record<string, string> = {
      gwp_policy_count_trend: 'Gross premium & Policy count trend',
      claims_trend_by_status: 'Claims trend (GPA)',
      avg_premium_trend: 'Average premium trend',
      average_si_trend: 'Average sum insured trend',
      geo_distribution_policies: 'Policies by geography',
      policies_by_tenure_distribution: 'Policies by tenure distribution',
    };
    return respond(config, {
      componentId: id,
      componentType: 'chart',
      label: labels[id] ?? id,
      payload: {
        type: 'chart',
        data: dataById[id] ?? {},
        meta: { filters: {}, timestamp: now, traceId: 'local-demo' },
      },
    });
  }
  if (path.endsWith('/claims/recent-search')) {
    return respond(
      config,
      envelope({ claims: claims.slice(0, 2), pagination: page }, { partnerId, lob, productIds }),
    );
  }
  if (path.endsWith('/claims/minimal') || path.endsWith('/claims')) {
    const policyNumber = url.searchParams.get('policyNumber');
    const data = policyNumber
      ? claims.filter((claim) => claim.policyNumber === policyNumber)
      : claims;
    return respond(
      config,
      envelope({ claims: data, pagination: page }, { partnerId, lob, productIds }),
    );
  }
  if (path.endsWith('/claims/status-count')) {
    return respond(
      config,
      envelope({
        statusCounts: [
          { statusGroup: 'ONGOING', count: 1 },
          { statusGroup: 'COMPLETED', count: 1 },
          { statusGroup: 'REJECTED', count: 1 },
        ],
        totalCount: 3,
      }),
    );
  }
  if (path.endsWith(`/policies/${firstPolicy.policyNumber}`)) {
    return respond(
      config,
      envelope({ policies: [firstPolicy], pagination: page }, { partnerId, lob, productIds }),
    );
  }
  if (path.endsWith('/policies/search-capabilities')) {
    return respond(config, [
      { field: 'policyNumber', displayName: 'Policy number', multiValued: false },
      { field: 'phoneNumber', displayName: 'Mobile number', multiValued: false },
      { field: 'employeeId', displayName: 'Employee ID', multiValued: false },
    ]);
  }
  if (path.endsWith('/policies/recent-search') || path.endsWith('/policies')) {
    const selected = url.searchParams.get('policyNumber');
    const data = selected ? policies.filter((item) => item.policyNumber === selected) : policies;
    return respond(
      config,
      envelope({ policies: data, pagination: page }, { partnerId, lob, productIds }),
    );
  }
  const cachedClaim = claims.find((claim) => path.endsWith(`/claims/${claim.claimRequestNumber}`));
  if (cachedClaim) {
    return respond(
      config,
      envelope({ claims: [cachedClaim], pagination: page }, { partnerId, lob, productIds }),
    );
  }
  if (
    path.endsWith('/communications/entity/POLICY/id/' + firstPolicy.policyNumber) ||
    path.includes('/communications/entity/POLICY/id/')
  ) {
    return respond(config, envelope(communications));
  }
  if (
    path.endsWith('/communications/entity/CLAIM/id/' + firstClaim.claimRequestNumber) ||
    path.includes('/communications/entity/CLAIM/id/')
  ) {
    return respond(config, envelope(communications));
  }
  if (path.endsWith('/policy/share')) {
    return respond(
      config,
      envelope([
        {
          id: 'customer-aarav',
          name: 'Aarav Sharma',
          relationship: 'SELF',
          email: 'aarav@example.test',
          sms: '9876543210',
          whatsapp: '9876543210',
          type: 'CUSTOMER',
        },
        {
          id: 'nominee-mira',
          name: 'Mira Sharma',
          relationship: 'SPOUSE',
          email: 'mira@example.test',
          sms: '9876543211',
          whatsapp: '9876543211',
          type: 'NOMINEE',
        },
      ]),
    );
  }
  if (path.endsWith('/endorsements')) {
    return respond(
      config,
      envelope({
        policy_id: firstPolicy.policyId,
        endorsements: [
          {
            created_by: { name: 'Operations team' },
            type: 'Member update',
            applicable_for: 'Insured member',
            date: '2026-09-02T10:00:00Z',
            description: 'Updated member contact details',
            status: 'COMPLETED',
          },
        ],
        pagination: page,
      }),
    );
  }
  if (path.endsWith('/refund-details')) {
    return respond(
      config,
      envelope({
        policyEkey: firstPolicy.policyId,
        policyNumber: firstPolicy.policyNumber,
        productId: productIds[0],
        uiState: 'MANUAL_INITIATED',
        originalPremium: 12500,
        currentPremium: 10050,
        refundAmount: 2450,
        refundSource: 'POLICY_CANCELLATION',
        refunds: [
          {
            cashfreeTransferId: 'demo-transfer-184',
            requestId: 'REF-2026-00184',
            refundAmount: 2450,
            initiatedOn: '2026-09-20T10:00:00Z',
            utr: null,
            status: 'PENDING',
            customerAccountDetails: {
              number: 'XXXXXX4120',
              ifsc: 'HDFC0000123',
              name: 'Aarav Sharma',
              bankName: 'HDFC Bank',
            },
            userType: 'CUSTOMER',
            retryable: true,
            uiState: 'MANUAL_INITIATED',
            expectedBy: '2026-09-27',
          },
        ],
        activeManualRefund: manualRefunds[0],
        expectedBy: '2026-09-27',
      }),
    );
  }
  if (path.endsWith('/bank-details')) {
    return respond(
      config,
      envelope([
        {
          ifsc: 'HDFC0000123',
          accountHolder: 'Aarav Sharma',
          accountNumber: 'XXXXXX4120',
          bankName: 'HDFC Bank',
        },
      ]),
    );
  }
  if (path.endsWith('/calculate-refund')) {
    const breakup = {
      amount: 2450,
      gst: 0,
      sgst: 0,
      cgst: 0,
      igst: 0,
      breakup: [{ label: 'Pro-rata premium', amount: 2450 }],
    };
    return respond(
      config,
      envelope({
        plan: 'zomato_health_plus',
        originalPremium: { ...breakup, amount: 12500 },
        updatedPremium: { ...breakup, amount: 10050 },
        refundPremium: breakup,
        withinFreeLookPeriod: false,
      }),
    );
  }
  if (path.endsWith('/manual-refunds')) {
    const status = url.searchParams.get('status');
    const refunds = status
      ? manualRefunds.filter((refund) => refund.status === status)
      : manualRefunds;
    return respond(
      config,
      envelope({
        refunds,
        pagination: {
          page: 1,
          size: 15,
          totalElements: refunds.length,
          totalPages: 1,
          hasNext: false,
        },
      }),
    );
  }
  if (path.endsWith('/transaction-summary')) {
    const transactions = [
      {
        periodStart: '2026-09-01',
        periodEnd: '2026-09-07',
        depositAmount: 500000,
        issuanceAmount: 184500,
        endorsementAmount: 12500,
        accountRefundAmount: 2450,
        depositUtr: 'DEMO-UTR-0926',
        tcsAmount: 1845,
        tdsAmount: 0,
        totalBalance: 3200000,
      },
      {
        periodStart: '2026-08-25',
        periodEnd: '2026-08-31',
        depositAmount: 250000,
        issuanceAmount: 164000,
        endorsementAmount: 9200,
        accountRefundAmount: 0,
        depositUtr: 'DEMO-UTR-0826',
        tcsAmount: 1640,
        tdsAmount: 0,
        totalBalance: 2888450,
      },
      {
        periodStart: '2026-08-18',
        periodEnd: '2026-08-24',
        depositAmount: 0,
        issuanceAmount: 148500,
        endorsementAmount: 5100,
        accountRefundAmount: 1200,
        depositUtr: 'DEMO-UTR-0818',
        tcsAmount: 1485,
        tdsAmount: 0,
        totalBalance: 2639250,
      },
    ];
    return respond(config, {
      success: true,
      message: 'Demo ledger',
      data: { transactions, pagination: page },
      meta: { filters: {}, timestamp: now, traceId: 'local-demo', errors: [] },
    });
  }
  if (path.endsWith('/float/month-coverage')) {
    const combined = {
      currentFloatBalance: 3200000,
      sumTotalBalanceInLookBack: 1845200,
      sumTotalSpentInLookBack: 1845200,
      averagePerDaySpend: 61506,
      remainingDaysInMonth: 18,
      requiredBalanceForMonth: 1107108,
      isTopUpNeeded: false,
      topUpAmount: 0,
      coverageTill: '2026-10-31',
      alertThreshold: 500000,
    };
    return respond(config, {
      success: true,
      message: 'Demo float coverage',
      data: {
        combined,
        breakDown: [{ ...combined, productId: productIds[0] }],
        lastFetched: now,
        lookBackPeriodDays: 30,
      },
    });
  }
  if (path.includes('/metabase/dashboards/')) {
    const dashboardKey = path.split('/').at(-2) ?? 'partnership-dashboard';
    return respond(
      config,
      envelope({
        dashboardKey,
        dashboardId: 'local-demo-report',
        embedUrl: '/mock-reports.html',
        expiresAtEpochSeconds: Math.floor(Date.now() / 1000) + 3600,
      }),
    );
  }
  if (path.includes('/policy/health-card/')) {
    if (path.endsWith('/pdf/UHID-1001'))
      return respond(
        config,
        envelope({ url: '/mock-health-card.html', fileName: 'Aarav-Sharma-health-card.html' }),
      );
    return respond(
      config,
      envelope([
        {
          name: 'Aarav Sharma',
          uhid: 'UHID-1001',
          healthCardNumber: 'HC-1001-2026',
          url: '/mock-health-card.html',
        },
      ]),
    );
  }
  if (path.includes('/claims/') && path.endsWith('/tracking'))
    return respond(
      config,
      envelope({
        claim_request_number: firstClaim.claimRequestNumber,
        machine_instance_id: 'demo-instance',
        cover_id: 'hospitalisation',
        current_internal_state: 'under_review',
        primary_stages: [
          {
            description: 'Claim received and registered',
            status: 'COMPLETED',
            timestamp: '2026-09-14T08:30:00Z',
            stage_key: 'claim_registered',
            display_name: 'Claim registered',
            transient_states: [],
            activity_timeline: [{ label: 'Claim submitted', timestamp: '2026-09-14T08:30:00Z' }],
            has_activity_timeline: true,
            is_terminal: false,
          },
          {
            description: 'Our claims team is reviewing the submitted documents',
            status: 'IN_PROGRESS',
            timestamp: '2026-09-15T10:00:00Z',
            eta: '2026-09-18T18:00:00Z',
            stage_key: 'claim_review',
            display_name: 'Under review',
            transient_states: [
              {
                state: 'DOCUMENT_REVIEW',
                description: 'Documents received',
                status: 'COMPLETED',
                timestamp: '2026-09-15T10:00:00Z',
                state_key: 'documents_received',
                display_name: 'Documents received',
                requires_action: false,
              },
            ],
            activity_timeline: [],
            has_activity_timeline: false,
            is_terminal: false,
          },
        ],
      }),
    );
  if (path.includes('/claims/') && path.endsWith('/documents')) {
    return respond(
      config,
      envelope({
        uploadedDocuments: [
          {
            documentId: 'demo-doc-1',
            pageId: 'demo-page-1',
            type: 'HOSPITAL_BILL',
            name: 'Hospital bill.pdf',
            filename: 'hospital-bill.pdf',
            state: 'UPLOADED',
            viewUrl: '/mock-document.html',
            uploadedAt: now,
            uploadedBy: {
              id: 'local-demo-user',
              name: 'Nikhil Demo',
              email: 'demo@example.test',
              phone: '9000000000',
            },
            note: 'Demo attachment',
          },
        ],
        requestedDocuments: [
          {
            documentId: 'demo-doc-2',
            pageId: 'demo-page-2',
            filename: 'Discharge summary.pdf',
            type: 'DISCHARGE_SUMMARY',
            state: 'PENDING',
            isResubmission: false,
            note: '',
            comment: 'Please upload the discharge summary',
          },
        ],
        machineInstanceId: 'demo-instance',
        taskId: 'demo-task',
      }),
    );
  }

  return respond(config, envelope({ items: [], pagination: page }));
};
