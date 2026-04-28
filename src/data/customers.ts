/**
 * Layer 5c — Per-account derivation
 *
 * Resolved state for all 12 customers in the migration cohort.
 * Derived from Layers 1-4: customer profiles + migration state (Layer 1),
 * tier + health rules (Layer 2), owner assignment + escalation (Layer 3),
 * action state machine + timing (Layer 4).
 *
 * Time-relative fields use day offsets from `now` (computed at app load
 * per Layer 5b time mocking strategy). The app converts offsets to
 * displayable values at render time.
 */

// =====================
// Type definitions
// =====================

export type Tier = 'senior_migration' | 'churn_watch' | 'standard';
export type TierTransition = 'auto_promoted' | null;
export type Flag = 'legal_escalation' | 'contract_protected';
export type TrackMix = 'track_a_dominant' | 'track_b_dominant' | 'mixed';
export type HealthSignal = 'green' | 'amber' | 'red';
export type Disposition = 'hold' | 'convert' | 'release';
export type CSMHandover = 'omnipresent_only' | 'in_handover' | 'deel_assigned';
export type ActionState = 'ACTING' | 'BLOCKED_BUT_DRIVEN' | 'ESCALATING';
export type BlockerCategory =
  | 'CUSTOMER_SIDE'
  | 'DEEL_INTERNAL'
  | 'THIRD_PARTY'
  | 'LEGAL_COMPLIANCE'
  | null;
export type OwnerSeniority = 'named' | 'pooled' | 'omnipresent_only';

export type FrictionSurface =
  | 'csm_continuity_break'
  | 'payroll_cutoff_shift'
  | 'benefits_substitution'
  | 'platform_learning_curve'
  | 'document_data_lag'
  | 'bundled_service_unbundling'
  | 'tax_election_reflagging';

export interface Health {
  responsiveness: HealthSignal;
  ticketVolume: HealthSignal;
  milestoneProgress: HealthSignal;
  stakeholderEngagement: HealthSignal;
  overall: HealthSignal;
  notes: Partial<Record<keyof Omit<Health, 'overall' | 'notes'>, string>>;
}

export interface Owners {
  accountOwner: { role: 'CSM'; seniority: OwnerSeniority };
  commercialOwner: { role: 'AE'; seniority: OwnerSeniority };
  migrationLead: { role: 'HR_IM'; seniority: OwnerSeniority };
  retentionSpecialistPaired: boolean;
  crossFunctionalEscalationActive: boolean;
}

export interface Specialist {
  type: 'payroll_implementation' | 'legal_ops' | 'compliance' | 'us_legal' | 'global_mobility';
  countrySpecialty?: string;
  reason: string;
}

export interface Action {
  id: string;
  type: 'friction_surface' | 'quote_workflow' | 'escalation' | 'renewal_prep';
  description: string;
  state: ActionState;
  blockerCategory: BlockerCategory;
  ageDays: number;
  ownerRole: string;
  fiveDayBoundaryBreach: boolean;
  trackContext?: 'A' | 'B' | 'mixed';
  countryContext?: string;
}

export interface CustomerFacingSLA {
  active: boolean;
  responseWindowHours: number;
  hoursElapsed: number;
}

export interface QuoteSLA {
  active: boolean;
  daysIssuedAgo: number;
  daysUntilDeadline: number;
  state: 'pending' | 'accepted' | 'rejected' | 'expired';
  affectedCountries: string[];
}

export interface Customer {
  // Identity (Layer 1)
  id: number;
  name: string;
  source: 'REAL' | 'SYNTHETIC';

  // Profile (Layer 1)
  workersTotal: number;
  eorWorkers: number;
  contractorWorkers: number;
  peoUsWorkers: number;
  countriesCount: number;
  countriesList: string[];
  highRiskFlags: string[];
  tenureMonths: number;
  industry: string;
  arrUsd: number;
  arrProvenance: 'PUBLISHED' | 'PARTIAL' | 'ESTIMATE' | 'SYNTHETIC';

  // Track (Layer 1, evolved model)
  trackMix: TrackMix;
  countryTrackMap: Record<string, 'A' | 'B'>;

  // Tier + flags (Layer 2)
  tier: Tier;
  tierTransition: TierTransition;
  tierTransitionDayOffset?: number; // negative = days ago
  originalTier?: Tier;
  flags: Flag[];
  complexityScore: number;
  churnRiskScore: number;

  // Health (Layer 2)
  health: Health;

  // Owners (Layer 3)
  owners: Owners;
  specialistsEngaged: Specialist[];

  // Migration state (Layer 1)
  skuMismatchFlag: boolean;
  frictionSurfacesActive: FrictionSurface[];
  csmHandoverState: CSMHandover;
  disposition: Disposition;
  renewalDate: string; // ISO date

  // Track B quote workflow (Layer 4)
  quoteSLA: QuoteSLA | null;

  // Action state (Layer 4)
  activeActions: Action[];

  // Customer-facing SLA (Layer 3)
  customerFacingSLA: CustomerFacingSLA;

  // Repricing position (Layer 3 commercial)
  repricingPosition?: {
    currentRate: number; // PEPM
    deelListRate: number;
    deelEquivalentRate: number;
  };
}

// =====================
// Customer cohort
// =====================

export const customers: Customer[] = [
  {
    // 1. Soundtrap — calm Track A, modest Standard tier
    id: 1,
    name: 'Soundtrap',
    source: 'REAL',
    workersTotal: 35,
    eorWorkers: 30,
    contractorWorkers: 5,
    peoUsWorkers: 0,
    countriesCount: 8,
    countriesList: ['US', 'GB', 'DE', 'SE', 'NL', 'ES', 'FR', 'AU'],
    highRiskFlags: ['DE', 'FR', 'NL'],
    tenureMonths: 18,
    industry: 'Music tech / SaaS',
    arrUsd: 160000,
    arrProvenance: 'ESTIMATE',
    trackMix: 'track_a_dominant',
    countryTrackMap: { US: 'A', GB: 'A', DE: 'A', SE: 'A', NL: 'A', ES: 'A', FR: 'A', AU: 'A' },
    tier: 'standard',
    tierTransition: null,
    flags: [],
    complexityScore: 48,
    churnRiskScore: 30,
    health: {
      responsiveness: 'green',
      ticketVolume: 'green',
      milestoneProgress: 'green',
      stakeholderEngagement: 'green',
      overall: 'green',
      notes: {},
    },
    owners: {
      accountOwner: { role: 'CSM', seniority: 'pooled' },
      commercialOwner: { role: 'AE', seniority: 'pooled' },
      migrationLead: { role: 'HR_IM', seniority: 'pooled' },
      retentionSpecialistPaired: false,
      crossFunctionalEscalationActive: false,
    },
    specialistsEngaged: [
      {
        type: 'compliance',
        countrySpecialty: 'DE/FR/NL',
        reason: 'Routine benefits substitution review for regulated EU markets',
      },
    ],
    skuMismatchFlag: false,
    frictionSurfacesActive: ['benefits_substitution'],
    csmHandoverState: 'deel_assigned',
    disposition: 'convert',
    renewalDate: '2026-09-15',
    quoteSLA: null,
    activeActions: [
      {
        id: 'soundtrap-benefits-1',
        type: 'friction_surface',
        description: 'Benefits substitution review for DE/FR/NL pension plans',
        state: 'ACTING',
        blockerCategory: null,
        ageDays: 2,
        ownerRole: 'Compliance team',
        fiveDayBoundaryBreach: false,
        trackContext: 'A',
        countryContext: 'DE/FR/NL',
      },
    ],
    customerFacingSLA: { active: false, responseWindowHours: 48, hoursElapsed: 0 },
  },

  {
    // 2. Halfbrick — pre-baked Day-14 auto-promotion (the historical proof)
    id: 2,
    name: 'Halfbrick',
    source: 'REAL',
    workersTotal: 25,
    eorWorkers: 25,
    contractorWorkers: 0,
    peoUsWorkers: 0,
    countriesCount: 17,
    countriesList: [
      'US', 'AU', 'GB', 'DE', 'FR', 'BR', 'IN', 'CA', 'JP', 'SG',
      'MX', 'NZ', 'IE', 'ES', 'PL', 'NO', 'DK',
    ],
    highRiskFlags: ['DE', 'FR', 'BR', 'IN'],
    tenureMonths: 22,
    industry: 'Gaming',
    arrUsd: 135000,
    arrProvenance: 'ESTIMATE',
    trackMix: 'mixed',
    countryTrackMap: {
      US: 'A', AU: 'A', GB: 'A', DE: 'A', FR: 'A', BR: 'A', IN: 'A', CA: 'A',
      JP: 'A', SG: 'A', MX: 'A', NZ: 'B', IE: 'A', ES: 'A', PL: 'B', NO: 'B', DK: 'B',
    },
    tier: 'churn_watch',
    tierTransition: 'auto_promoted',
    tierTransitionDayOffset: -14,
    originalTier: 'standard',
    flags: [],
    complexityScore: 54,
    churnRiskScore: 50,
    health: {
      responsiveness: 'amber',
      ticketVolume: 'red',
      milestoneProgress: 'red',
      stakeholderEngagement: 'green',
      overall: 'red',
      notes: {
        responsiveness:
          "HR lead response time slipped to 4 days, likely overwhelmed by ticket volume.",
        ticketVolume:
          'Worker ticket volume tripled in past week. 17-country footprint creating compounding load — Brazil and India payroll cycles firing simultaneously generated cascade of statutory questions.',
        milestoneProgress:
          'Brazil eSocial validation 5 days behind. India statutory compliance review pending. Two milestones slipping concurrently.',
      },
    },
    owners: {
      accountOwner: { role: 'CSM', seniority: 'named' },
      commercialOwner: { role: 'AE', seniority: 'named' },
      migrationLead: { role: 'HR_IM', seniority: 'named' },
      retentionSpecialistPaired: true,
      crossFunctionalEscalationActive: true,
    },
    specialistsEngaged: [
      {
        type: 'payroll_implementation',
        countrySpecialty: 'BR',
        reason: 'eSocial validation delay — partner-side coordination required',
      },
      {
        type: 'payroll_implementation',
        countrySpecialty: 'IN',
        reason: 'Statutory compliance review pending',
      },
      {
        type: 'compliance',
        reason: 'Multi-jurisdictional ticket cascade requires compliance review',
      },
    ],
    skuMismatchFlag: false,
    frictionSurfacesActive: [
      'tax_election_reflagging',
      'document_data_lag',
      'platform_learning_curve',
    ],
    csmHandoverState: 'in_handover',
    disposition: 'convert',
    renewalDate: '2027-01-20',
    quoteSLA: null,
    activeActions: [
      {
        id: 'halfbrick-br-1',
        type: 'friction_surface',
        description: 'Brazil eSocial validation 5 days behind schedule',
        state: 'BLOCKED_BUT_DRIVEN',
        blockerCategory: 'CUSTOMER_SIDE',
        ageDays: 5,
        ownerRole: 'Payroll IM (BR)',
        fiveDayBoundaryBreach: true,
        trackContext: 'A',
        countryContext: 'BR',
      },
      {
        id: 'halfbrick-in-1',
        type: 'friction_surface',
        description: 'India statutory compliance review pending — government system delay',
        state: 'BLOCKED_BUT_DRIVEN',
        blockerCategory: 'THIRD_PARTY',
        ageDays: 3,
        ownerRole: 'Payroll IM (IN)',
        fiveDayBoundaryBreach: false,
        trackContext: 'A',
        countryContext: 'IN',
      },
      {
        id: 'halfbrick-tickets-1',
        type: 'escalation',
        description: 'Worker ticket cascade across 17 countries — capacity strain',
        state: 'ESCALATING',
        blockerCategory: 'DEEL_INTERNAL',
        ageDays: 2,
        ownerRole: 'CSM team lead',
        fiveDayBoundaryBreach: false,
      },
    ],
    customerFacingSLA: { active: true, responseWindowHours: 24, hoursElapsed: 3 },
  },

  {
    // 3. Proof — only "hold" disposition, Contract-Protected
    id: 3,
    name: 'Proof',
    source: 'REAL',
    workersTotal: 45,
    eorWorkers: 35,
    contractorWorkers: 0,
    peoUsWorkers: 10,
    countriesCount: 5,
    countriesList: ['US', 'CA', 'GB', 'IE', 'AU'],
    highRiskFlags: [],
    tenureMonths: 14,
    industry: 'Legal tech',
    arrUsd: 200000,
    arrProvenance: 'ESTIMATE',
    trackMix: 'track_a_dominant',
    countryTrackMap: { US: 'A', CA: 'A', GB: 'A', IE: 'A', AU: 'A' },
    tier: 'standard',
    tierTransition: null,
    flags: ['legal_escalation', 'contract_protected'],
    complexityScore: 72,
    churnRiskScore: 30,
    health: {
      responsiveness: 'green',
      ticketVolume: 'green',
      milestoneProgress: 'green',
      stakeholderEngagement: 'green',
      overall: 'green',
      notes: {},
    },
    owners: {
      accountOwner: { role: 'CSM', seniority: 'pooled' },
      commercialOwner: { role: 'AE', seniority: 'pooled' },
      migrationLead: { role: 'HR_IM', seniority: 'pooled' },
      retentionSpecialistPaired: false,
      crossFunctionalEscalationActive: false,
    },
    specialistsEngaged: [
      {
        type: 'us_legal',
        reason: 'PEO-US workers require Head of US Legal team review on any contract change',
      },
      {
        type: 'legal_ops',
        reason: 'Contract-Protected flag — multi-year contract terms require Legal Ops review',
      },
    ],
    skuMismatchFlag: true,
    frictionSurfacesActive: ['benefits_substitution', 'bundled_service_unbundling'],
    csmHandoverState: 'deel_assigned',
    disposition: 'hold',
    renewalDate: '2026-08-10',
    quoteSLA: null,
    activeActions: [
      {
        id: 'proof-renewal-prep-1',
        type: 'renewal_prep',
        description: 'Renewal preparation — multi-year contract terms must survive transition',
        state: 'ACTING',
        blockerCategory: null,
        ageDays: 7,
        ownerRole: 'Account Owner + Commercial Owner pair',
        fiveDayBoundaryBreach: false,
      },
    ],
    customerFacingSLA: { active: false, responseWindowHours: 48, hoursElapsed: 0 },
  },

  {
    // 4. Layer.ai — short tenure, IN exposure, watch health
    id: 4,
    name: 'Layer.ai',
    source: 'REAL',
    workersTotal: 28,
    eorWorkers: 22,
    contractorWorkers: 6,
    peoUsWorkers: 0,
    countriesCount: 6,
    countriesList: ['US', 'GB', 'DE', 'IN', 'SG', 'CA'],
    highRiskFlags: ['DE', 'IN'],
    tenureMonths: 9,
    industry: 'AI / SaaS',
    arrUsd: 120000,
    arrProvenance: 'ESTIMATE',
    trackMix: 'track_a_dominant',
    countryTrackMap: { US: 'A', GB: 'A', DE: 'A', IN: 'A', SG: 'A', CA: 'A' },
    tier: 'standard',
    tierTransition: null,
    flags: [],
    complexityScore: 39,
    churnRiskScore: 50,
    health: {
      responsiveness: 'green',
      ticketVolume: 'green',
      milestoneProgress: 'amber',
      stakeholderEngagement: 'green',
      overall: 'amber',
      notes: {
        milestoneProgress:
          'India statutory compliance review pending. Local payroll partner (India) engaged. No customer impact yet.',
      },
    },
    owners: {
      accountOwner: { role: 'CSM', seniority: 'pooled' },
      commercialOwner: { role: 'AE', seniority: 'pooled' },
      migrationLead: { role: 'HR_IM', seniority: 'pooled' },
      retentionSpecialistPaired: false,
      crossFunctionalEscalationActive: false,
    },
    specialistsEngaged: [
      {
        type: 'payroll_implementation',
        countrySpecialty: 'IN',
        reason: 'India statutory compliance review',
      },
    ],
    skuMismatchFlag: false,
    frictionSurfacesActive: ['platform_learning_curve', 'document_data_lag'],
    csmHandoverState: 'in_handover',
    disposition: 'convert',
    renewalDate: '2026-12-05',
    quoteSLA: null,
    activeActions: [
      {
        id: 'layerai-in-1',
        type: 'friction_surface',
        description: 'India statutory compliance review',
        state: 'ACTING',
        blockerCategory: null,
        ageDays: 4,
        ownerRole: 'Payroll IM (IN)',
        fiveDayBoundaryBreach: false,
        trackContext: 'A',
        countryContext: 'IN',
      },
      {
        id: 'layerai-platform-1',
        type: 'friction_surface',
        description: 'Customer team learning new Deel platform — onboarding cycle',
        state: 'ACTING',
        blockerCategory: null,
        ageDays: 2,
        ownerRole: 'Migration Lead',
        fiveDayBoundaryBreach: false,
      },
    ],
    customerFacingSLA: { active: false, responseWindowHours: 48, hoursElapsed: 0 },
  },

  {
    // 5. Cube — calm Track A, similar to Soundtrap profile
    id: 5,
    name: 'Cube',
    source: 'REAL',
    workersTotal: 35,
    eorWorkers: 30,
    contractorWorkers: 5,
    peoUsWorkers: 0,
    countriesCount: 7,
    countriesList: ['US', 'GB', 'DE', 'FR', 'NL', 'CA', 'IE'],
    highRiskFlags: ['DE', 'FR', 'NL'],
    tenureMonths: 16,
    industry: 'Data / SaaS',
    arrUsd: 160000,
    arrProvenance: 'ESTIMATE',
    trackMix: 'track_a_dominant',
    countryTrackMap: { US: 'A', GB: 'A', DE: 'A', FR: 'A', NL: 'A', CA: 'A', IE: 'A' },
    tier: 'standard',
    tierTransition: null,
    flags: [],
    complexityScore: 44,
    churnRiskScore: 30,
    health: {
      responsiveness: 'green',
      ticketVolume: 'green',
      milestoneProgress: 'green',
      stakeholderEngagement: 'green',
      overall: 'green',
      notes: {},
    },
    owners: {
      accountOwner: { role: 'CSM', seniority: 'pooled' },
      commercialOwner: { role: 'AE', seniority: 'pooled' },
      migrationLead: { role: 'HR_IM', seniority: 'pooled' },
      retentionSpecialistPaired: false,
      crossFunctionalEscalationActive: false,
    },
    specialistsEngaged: [
      {
        type: 'compliance',
        countrySpecialty: 'DE/FR/NL',
        reason: 'Routine benefits substitution review',
      },
    ],
    skuMismatchFlag: false,
    frictionSurfacesActive: ['benefits_substitution'],
    csmHandoverState: 'deel_assigned',
    disposition: 'convert',
    renewalDate: '2026-11-08',
    quoteSLA: null,
    activeActions: [
      {
        id: 'cube-benefits-1',
        type: 'friction_surface',
        description: 'Benefits substitution review for DE/FR/NL pension plans',
        state: 'ACTING',
        blockerCategory: null,
        ageDays: 1,
        ownerRole: 'Compliance team',
        fiveDayBoundaryBreach: false,
        trackContext: 'A',
        countryContext: 'DE/FR/NL',
      },
    ],
    customerFacingSLA: { active: false, responseWindowHours: 48, hoursElapsed: 0 },
  },

  {
    // 6. Sphere — canonical "do nothing" account
    id: 6,
    name: 'Sphere',
    source: 'REAL',
    workersTotal: 22,
    eorWorkers: 18,
    contractorWorkers: 4,
    peoUsWorkers: 0,
    countriesCount: 5,
    countriesList: ['US', 'GB', 'CA', 'AU', 'IE'],
    highRiskFlags: [],
    tenureMonths: 28,
    industry: 'SaaS',
    arrUsd: 109000,
    arrProvenance: 'ESTIMATE',
    trackMix: 'track_a_dominant',
    countryTrackMap: { US: 'A', GB: 'A', CA: 'A', AU: 'A', IE: 'A' },
    tier: 'standard',
    tierTransition: null,
    flags: [],
    complexityScore: 34,
    churnRiskScore: 10,
    health: {
      responsiveness: 'green',
      ticketVolume: 'green',
      milestoneProgress: 'green',
      stakeholderEngagement: 'green',
      overall: 'green',
      notes: {},
    },
    owners: {
      accountOwner: { role: 'CSM', seniority: 'pooled' },
      commercialOwner: { role: 'AE', seniority: 'pooled' },
      migrationLead: { role: 'HR_IM', seniority: 'omnipresent_only' },
      retentionSpecialistPaired: false,
      crossFunctionalEscalationActive: false,
    },
    specialistsEngaged: [],
    skuMismatchFlag: false,
    frictionSurfacesActive: [],
    csmHandoverState: 'omnipresent_only',
    disposition: 'convert',
    renewalDate: '2026-06-15',
    quoteSLA: null,
    activeActions: [],
    customerFacingSLA: { active: false, responseWindowHours: 48, hoursElapsed: 0 },
  },

  {
    // 7. Meridian — Senior Migration centerpiece (Track A-dominant)
    id: 7,
    name: 'Meridian Health Analytics',
    source: 'SYNTHETIC',
    workersTotal: 210,
    eorWorkers: 140,
    contractorWorkers: 40,
    peoUsWorkers: 30,
    countriesCount: 10,
    countriesList: ['US', 'CA', 'GB', 'DE', 'FR', 'NL', 'IN', 'BR', 'SG', 'AU'],
    highRiskFlags: ['DE', 'FR', 'NL', 'BR', 'IN'],
    tenureMonths: 20,
    industry: 'HealthTech / SaaS',
    arrUsd: 580000,
    arrProvenance: 'SYNTHETIC',
    trackMix: 'track_a_dominant',
    countryTrackMap: {
      US: 'A', CA: 'A', GB: 'A', DE: 'A', FR: 'A', NL: 'A', IN: 'A', BR: 'A', SG: 'A', AU: 'A',
    },
    tier: 'senior_migration',
    tierTransition: null,
    flags: ['legal_escalation'],
    complexityScore: 98,
    churnRiskScore: 40,
    health: {
      responsiveness: 'green',
      ticketVolume: 'green',
      milestoneProgress: 'amber',
      stakeholderEngagement: 'green',
      overall: 'amber',
      notes: {
        milestoneProgress:
          'Brazil eSocial sync running 3 days behind schedule. Local payroll partner (Brazil) engaged with Omnipresent migration team to resolve.',
      },
    },
    owners: {
      accountOwner: { role: 'CSM', seniority: 'named' },
      commercialOwner: { role: 'AE', seniority: 'named' },
      migrationLead: { role: 'HR_IM', seniority: 'named' },
      retentionSpecialistPaired: false,
      crossFunctionalEscalationActive: false,
    },
    specialistsEngaged: [
      {
        type: 'us_legal',
        reason: 'PEO-US workers — Head of US Legal team review on contract terms',
      },
      {
        type: 'legal_ops',
        reason: 'Multi-jurisdictional contract review across 10 countries',
      },
      {
        type: 'payroll_implementation',
        countrySpecialty: 'BR',
        reason: 'eSocial sync delay — coordination with Omnipresent migration team',
      },
      {
        type: 'payroll_implementation',
        countrySpecialty: 'IN',
        reason: 'Tax-election re-flagging required',
      },
      {
        type: 'compliance',
        countrySpecialty: 'DE/FR/NL',
        reason: 'Benefits substitution review for regulated EU markets',
      },
    ],
    skuMismatchFlag: true,
    frictionSurfacesActive: [
      'csm_continuity_break',
      'benefits_substitution',
      'tax_election_reflagging',
    ],
    csmHandoverState: 'in_handover',
    disposition: 'convert',
    renewalDate: '2026-10-30',
    quoteSLA: null,
    activeActions: [
      {
        id: 'meridian-csm-1',
        type: 'friction_surface',
        description: 'CSM continuity break — Omnipresent CSM transitioning out, Deel CSM not yet fully oriented',
        state: 'BLOCKED_BUT_DRIVEN',
        blockerCategory: 'DEEL_INTERNAL',
        ageDays: 3,
        ownerRole: 'Named CSM (with handover support)',
        fiveDayBoundaryBreach: false,
      },
      {
        id: 'meridian-benefits-1',
        type: 'friction_surface',
        description: 'Benefits substitution gap in regulated DE/NL/FR markets',
        state: 'ACTING',
        blockerCategory: null,
        ageDays: 5,
        ownerRole: 'Compliance team',
        fiveDayBoundaryBreach: true,
        trackContext: 'A',
        countryContext: 'DE/NL/FR',
      },
      {
        id: 'meridian-tax-1',
        type: 'friction_surface',
        description: 'Tax-election re-flagging for NL 30% ruling and BR statutory complexity',
        state: 'ACTING',
        blockerCategory: null,
        ageDays: 2,
        ownerRole: 'Payroll IM (NL, BR)',
        fiveDayBoundaryBreach: false,
        trackContext: 'A',
        countryContext: 'NL/BR',
      },
    ],
    customerFacingSLA: { active: false, responseWindowHours: 48, hoursElapsed: 0 },
    repricingPosition: {
      currentRate: 425,
      deelListRate: 899,
      deelEquivalentRate: 580,
    },
  },

  {
    // 8. Northwind — Track B live-fire demo subject (PRE-FLIP state)
    id: 8,
    name: 'Northwind Renewables',
    source: 'SYNTHETIC',
    workersTotal: 95,
    eorWorkers: 75,
    contractorWorkers: 15,
    peoUsWorkers: 5,
    countriesCount: 6,
    countriesList: ['US', 'DE', 'NL', 'DK', 'NO', 'SE'],
    highRiskFlags: ['DE', 'NL'],
    tenureMonths: 26,
    industry: 'CleanTech',
    arrUsd: 355000,
    arrProvenance: 'SYNTHETIC',
    trackMix: 'mixed',
    countryTrackMap: { US: 'A', DE: 'A', NL: 'A', DK: 'B', NO: 'B', SE: 'A' },
    tier: 'senior_migration',
    tierTransition: null,
    flags: ['legal_escalation'],
    complexityScore: 79,
    churnRiskScore: 10,
    health: {
      responsiveness: 'green',
      ticketVolume: 'green',
      milestoneProgress: 'green',
      stakeholderEngagement: 'green',
      overall: 'green',
      notes: {},
    },
    owners: {
      accountOwner: { role: 'CSM', seniority: 'named' },
      commercialOwner: { role: 'AE', seniority: 'named' },
      migrationLead: { role: 'HR_IM', seniority: 'named' },
      retentionSpecialistPaired: false,
      crossFunctionalEscalationActive: false,
    },
    specialistsEngaged: [
      {
        type: 'us_legal',
        reason: 'PEO-US workers — contract review',
      },
      {
        type: 'compliance',
        countrySpecialty: 'DE/NL',
        reason: 'Benefits substitution for regulated EU markets',
      },
    ],
    skuMismatchFlag: true,
    frictionSurfacesActive: ['benefits_substitution', 'payroll_cutoff_shift'],
    csmHandoverState: 'deel_assigned',
    disposition: 'convert',
    renewalDate: '2026-09-25',
    quoteSLA: {
      active: true,
      daysIssuedAgo: 14,
      daysUntilDeadline: 0,
      state: 'accepted',
      affectedCountries: ['DK', 'NO'],
    },
    activeActions: [
      {
        id: 'northwind-benefits-1',
        type: 'friction_surface',
        description: 'Benefits substitution review for DE/NL pension plans',
        state: 'ACTING',
        blockerCategory: null,
        ageDays: 4,
        ownerRole: 'Compliance team',
        fiveDayBoundaryBreach: false,
        trackContext: 'A',
        countryContext: 'DE/NL',
      },
      {
        id: 'northwind-payroll-1',
        type: 'friction_surface',
        description: 'Payroll cutoff shift transition — first cycle on new schedule',
        state: 'ACTING',
        blockerCategory: null,
        ageDays: 2,
        ownerRole: 'Migration Lead',
        fiveDayBoundaryBreach: false,
      },
    ],
    customerFacingSLA: { active: false, responseWindowHours: 48, hoursElapsed: 0 },
    repricingPosition: {
      currentRate: 480,
      deelListRate: 899,
      deelEquivalentRate: 540,
    },
  },

  {
    // 9. Kestrel — Standard with Legal Escalation (mixed track, KR partner)
    id: 9,
    name: 'Kestrel Robotics',
    source: 'SYNTHETIC',
    workersTotal: 60,
    eorWorkers: 45,
    contractorWorkers: 8,
    peoUsWorkers: 7,
    countriesCount: 4,
    countriesList: ['US', 'DE', 'JP', 'KR'],
    highRiskFlags: ['DE'],
    tenureMonths: 8,
    industry: 'Robotics / Manufacturing',
    arrUsd: 250000,
    arrProvenance: 'SYNTHETIC',
    trackMix: 'mixed',
    countryTrackMap: { US: 'A', DE: 'A', JP: 'A', KR: 'B' },
    tier: 'standard',
    tierTransition: null,
    flags: ['legal_escalation'],
    complexityScore: 69,
    churnRiskScore: 50,
    health: {
      responsiveness: 'amber',
      ticketVolume: 'green',
      milestoneProgress: 'red',
      stakeholderEngagement: 'green',
      overall: 'amber',
      notes: {
        responsiveness:
          "Customer's HR lead response time slipping past 3 days, possibly tied to legal review delay.",
        milestoneProgress:
          'MSA + custom SKU contract terms 5 days past target. Legal Ops engaged. Customer-side legal review still pending.',
      },
    },
    owners: {
      accountOwner: { role: 'CSM', seniority: 'pooled' },
      commercialOwner: { role: 'AE', seniority: 'pooled' },
      migrationLead: { role: 'HR_IM', seniority: 'pooled' },
      retentionSpecialistPaired: false,
      crossFunctionalEscalationActive: false,
    },
    specialistsEngaged: [
      {
        type: 'us_legal',
        reason: 'PEO-US workers — contract review for custom SKU terms',
      },
      {
        type: 'legal_ops',
        reason: 'MSA + custom SKU contract drafting (5 days past target)',
      },
      {
        type: 'payroll_implementation',
        countrySpecialty: 'KR',
        reason: 'Korea partner-side coordination (Track B portion)',
      },
    ],
    skuMismatchFlag: true,
    frictionSurfacesActive: [
      'benefits_substitution',
      'tax_election_reflagging',
      'platform_learning_curve',
      'document_data_lag',
    ],
    csmHandoverState: 'in_handover',
    disposition: 'convert',
    renewalDate: '2026-12-18',
    quoteSLA: {
      active: true,
      daysIssuedAgo: 5,
      daysUntilDeadline: 2,
      state: 'pending',
      affectedCountries: ['KR'],
    },
    activeActions: [
      {
        id: 'kestrel-msa-1',
        type: 'friction_surface',
        description: 'MSA + custom SKU contract terms 5 days past target',
        state: 'BLOCKED_BUT_DRIVEN',
        blockerCategory: 'CUSTOMER_SIDE',
        ageDays: 5,
        ownerRole: 'Legal Ops',
        fiveDayBoundaryBreach: true,
      },
      {
        id: 'kestrel-kr-quote-1',
        type: 'quote_workflow',
        description: 'Track B re-quote for Korea workers — 2 days remaining on 7-day window',
        state: 'ACTING',
        blockerCategory: null,
        ageDays: 5,
        ownerRole: 'Commercial Owner (AE)',
        fiveDayBoundaryBreach: false,
        trackContext: 'B',
        countryContext: 'KR',
      },
    ],
    customerFacingSLA: { active: false, responseWindowHours: 48, hoursElapsed: 0 },
    repricingPosition: {
      currentRate: 460,
      deelListRate: 899,
      deelEquivalentRate: 595,
    },
  },

  {
    // 10. Palomar — Churn Watch, release candidate (NG partner)
    id: 10,
    name: 'Palomar Trading',
    source: 'SYNTHETIC',
    workersTotal: 40,
    eorWorkers: 35,
    contractorWorkers: 5,
    peoUsWorkers: 0,
    countriesCount: 5,
    countriesList: ['GB', 'AE', 'SG', 'NG', 'BR'],
    highRiskFlags: ['AE', 'NG', 'BR'],
    tenureMonths: 10,
    industry: 'Crypto / Trading',
    arrUsd: 190000,
    arrProvenance: 'SYNTHETIC',
    trackMix: 'mixed',
    countryTrackMap: { GB: 'A', AE: 'A', SG: 'A', NG: 'B', BR: 'A' },
    tier: 'churn_watch',
    tierTransition: null,
    flags: [],
    complexityScore: 36,
    churnRiskScore: 100,
    health: {
      responsiveness: 'red',
      ticketVolume: 'red',
      milestoneProgress: 'amber',
      stakeholderEngagement: 'red',
      overall: 'red',
      notes: {
        responsiveness:
          "Customer's CFO went silent 6 days ago after question about FX variance. CSM has chased twice. AE engaging exec sponsor for commercial conversation.",
        ticketVolume:
          'Worker complaints accelerating across NG and BR markets.',
        stakeholderEngagement:
          "CFO and HR Lead both unresponsive. Exec sponsor engagement attempt active.",
      },
    },
    owners: {
      accountOwner: { role: 'CSM', seniority: 'named' },
      commercialOwner: { role: 'AE', seniority: 'named' },
      migrationLead: { role: 'HR_IM', seniority: 'named' },
      retentionSpecialistPaired: true,
      crossFunctionalEscalationActive: false,
    },
    specialistsEngaged: [
      {
        type: 'payroll_implementation',
        countrySpecialty: 'NG',
        reason: 'Nigeria partner-side coordination (Track B portion, high regulatory volatility)',
      },
      {
        type: 'compliance',
        countrySpecialty: 'AE/NG/BR',
        reason: 'Multi-jurisdictional regulatory volatility',
      },
    ],
    skuMismatchFlag: false,
    frictionSurfacesActive: ['tax_election_reflagging', 'document_data_lag'],
    csmHandoverState: 'in_handover',
    disposition: 'release',
    renewalDate: '2026-12-10',
    quoteSLA: {
      active: true,
      daysIssuedAgo: 2,
      daysUntilDeadline: 5,
      state: 'pending',
      affectedCountries: ['NG'],
    },
    activeActions: [
      {
        id: 'palomar-cfo-1',
        type: 'friction_surface',
        description: "Customer CFO silent 6 days, exec sponsor engagement active",
        state: 'BLOCKED_BUT_DRIVEN',
        blockerCategory: 'CUSTOMER_SIDE',
        ageDays: 6,
        ownerRole: 'CSM + AE',
        fiveDayBoundaryBreach: true,
      },
      {
        id: 'palomar-ng-quote-1',
        type: 'quote_workflow',
        description: 'Track B re-quote for Nigeria workers — pending customer response',
        state: 'BLOCKED_BUT_DRIVEN',
        blockerCategory: 'CUSTOMER_SIDE',
        ageDays: 2,
        ownerRole: 'Commercial Owner (AE)',
        fiveDayBoundaryBreach: false,
        trackContext: 'B',
        countryContext: 'NG',
      },
    ],
    customerFacingSLA: { active: true, responseWindowHours: 24, hoursElapsed: 8 },
    repricingPosition: {
      currentRate: 475,
      deelListRate: 899,
      deelEquivalentRate: 575,
    },
  },

  {
    // 11. Corvus — calm Track A, long tenure
    id: 11,
    name: 'Corvus Legal Tech',
    source: 'SYNTHETIC',
    workersTotal: 30,
    eorWorkers: 25,
    contractorWorkers: 5,
    peoUsWorkers: 0,
    countriesCount: 4,
    countriesList: ['US', 'GB', 'IE', 'CA'],
    highRiskFlags: [],
    tenureMonths: 30,
    industry: 'Legal tech / SaaS',
    arrUsd: 136000,
    arrProvenance: 'SYNTHETIC',
    trackMix: 'track_a_dominant',
    countryTrackMap: { US: 'A', GB: 'A', IE: 'A', CA: 'A' },
    tier: 'standard',
    tierTransition: null,
    flags: [],
    complexityScore: 31,
    churnRiskScore: 10,
    health: {
      responsiveness: 'green',
      ticketVolume: 'green',
      milestoneProgress: 'green',
      stakeholderEngagement: 'amber',
      overall: 'amber',
      notes: {
        stakeholderEngagement:
          "Customer's HR lead on parental leave. Backup contact identified but not yet engaged.",
      },
    },
    owners: {
      accountOwner: { role: 'CSM', seniority: 'pooled' },
      commercialOwner: { role: 'AE', seniority: 'pooled' },
      migrationLead: { role: 'HR_IM', seniority: 'pooled' },
      retentionSpecialistPaired: false,
      crossFunctionalEscalationActive: false,
    },
    specialistsEngaged: [],
    skuMismatchFlag: false,
    frictionSurfacesActive: [],
    csmHandoverState: 'deel_assigned',
    disposition: 'convert',
    renewalDate: '2026-09-05',
    quoteSLA: null,
    activeActions: [],
    customerFacingSLA: { active: false, responseWindowHours: 48, hoursElapsed: 0 },
  },

  {
    // 12. Pivot — Churn Watch, release candidate (TR partner, fintech)
    id: 12,
    name: 'Pivot Payments',
    source: 'SYNTHETIC',
    workersTotal: 32,
    eorWorkers: 25,
    contractorWorkers: 5,
    peoUsWorkers: 2,
    countriesCount: 6,
    countriesList: ['US', 'GB', 'IE', 'AE', 'TR', 'MX'],
    highRiskFlags: ['AE', 'TR'],
    tenureMonths: 7,
    industry: 'Fintech',
    arrUsd: 135000,
    arrProvenance: 'SYNTHETIC',
    trackMix: 'mixed',
    countryTrackMap: { US: 'A', GB: 'A', IE: 'A', AE: 'A', TR: 'B', MX: 'A' },
    tier: 'churn_watch',
    tierTransition: null,
    flags: ['legal_escalation'],
    complexityScore: 74,
    churnRiskScore: 85,
    health: {
      responsiveness: 'red',
      ticketVolume: 'amber',
      milestoneProgress: 'red',
      stakeholderEngagement: 'red',
      overall: 'red',
      notes: {
        responsiveness:
          'Customer indicated active comparison with another EOR provider. Worker complaints up about Mexico payroll setup. CSM + AE in joint retention play.',
        milestoneProgress:
          'Multiple migration milestones slipping under retention pressure.',
        stakeholderEngagement:
          'Customer leadership signaling potential churn — CSM + AE joint retention engagement active.',
      },
    },
    owners: {
      accountOwner: { role: 'CSM', seniority: 'named' },
      commercialOwner: { role: 'AE', seniority: 'named' },
      migrationLead: { role: 'HR_IM', seniority: 'named' },
      retentionSpecialistPaired: true,
      crossFunctionalEscalationActive: false,
    },
    specialistsEngaged: [
      {
        type: 'us_legal',
        reason: 'PEO-US workers — contract terms under retention review',
      },
      {
        type: 'payroll_implementation',
        countrySpecialty: 'TR',
        reason: 'Turkey partner-side coordination (Track B portion, high regulatory volatility)',
      },
      {
        type: 'compliance',
        countrySpecialty: 'AE/TR',
        reason: 'Multi-jurisdictional regulatory review',
      },
    ],
    skuMismatchFlag: true,
    frictionSurfacesActive: [
      'tax_election_reflagging',
      'benefits_substitution',
      'platform_learning_curve',
      'document_data_lag',
    ],
    csmHandoverState: 'in_handover',
    disposition: 'release',
    renewalDate: '2026-11-12',
    quoteSLA: {
      active: true,
      daysIssuedAgo: 3,
      daysUntilDeadline: 4,
      state: 'pending',
      affectedCountries: ['TR'],
    },
    activeActions: [
      {
        id: 'pivot-retention-1',
        type: 'escalation',
        description: 'Active comparison with competitor EOR — joint CSM/AE retention play',
        state: 'ACTING',
        blockerCategory: null,
        ageDays: 4,
        ownerRole: 'Named CSM + Named AE',
        fiveDayBoundaryBreach: false,
      },
      {
        id: 'pivot-mx-1',
        type: 'friction_surface',
        description: 'Mexico payroll setup — worker complaints, escalating tickets',
        state: 'BLOCKED_BUT_DRIVEN',
        blockerCategory: 'DEEL_INTERNAL',
        ageDays: 4,
        ownerRole: 'Payroll IM (MX)',
        fiveDayBoundaryBreach: false,
        trackContext: 'A',
        countryContext: 'MX',
      },
      {
        id: 'pivot-tr-quote-1',
        type: 'quote_workflow',
        description: 'Track B re-quote for Turkey workers — pending customer response under retention pressure',
        state: 'BLOCKED_BUT_DRIVEN',
        blockerCategory: 'CUSTOMER_SIDE',
        ageDays: 3,
        ownerRole: 'Commercial Owner (AE)',
        fiveDayBoundaryBreach: false,
        trackContext: 'B',
        countryContext: 'TR',
      },
    ],
    customerFacingSLA: { active: true, responseWindowHours: 24, hoursElapsed: 5 },
    repricingPosition: {
      currentRate: 470,
      deelListRate: 899,
      deelEquivalentRate: 555,
    },
  },
];

// =====================
// Northwind post-flip state (used by demo button)
// =====================

/**
 * The state Northwind transitions to when the demo button is pressed.
 * The app applies this state to Northwind on button click, with the
 * sequenced animation timing specified in Layer 5b.
 */
export const northwindPostFlipState: Partial<Customer> = {
  tier: 'churn_watch',
  tierTransition: 'auto_promoted',
  tierTransitionDayOffset: 0, // just promoted (now)
  originalTier: 'senior_migration',
  health: {
    responsiveness: 'green',
    ticketVolume: 'red',
    milestoneProgress: 'red',
    stakeholderEngagement: 'red',
    overall: 'red',
    notes: {
      ticketVolume:
        'Worker tickets surging in DK/NO partner markets — payroll cycle questions and benefits clarifications cascading.',
      milestoneProgress:
        'Partner-side milestone slip on DK/NO contracts — third-party coordination breakdown.',
      stakeholderEngagement:
        'Customer HR lead and finance lead both signaling concern about Track B portion. Active retention engagement.',
    },
  },
  owners: {
    accountOwner: { role: 'CSM', seniority: 'named' },
    commercialOwner: { role: 'AE', seniority: 'named' },
    migrationLead: { role: 'HR_IM', seniority: 'named' },
    retentionSpecialistPaired: true,
    crossFunctionalEscalationActive: true,
  },
  activeActions: [
    {
      id: 'northwind-dk-tickets-1',
      type: 'friction_surface',
      description: 'DK worker ticket surge — partner-side payroll cycle questions',
      state: 'BLOCKED_BUT_DRIVEN',
      blockerCategory: 'THIRD_PARTY',
      ageDays: 0,
      ownerRole: 'Payroll IM (DK partner)',
      fiveDayBoundaryBreach: false,
      trackContext: 'B',
      countryContext: 'DK',
    },
    {
      id: 'northwind-no-milestone-1',
      type: 'friction_surface',
      description: 'NO partner-side milestone slip — contract coordination breakdown',
      state: 'BLOCKED_BUT_DRIVEN',
      blockerCategory: 'THIRD_PARTY',
      ageDays: 0,
      ownerRole: 'Payroll IM (NO partner)',
      fiveDayBoundaryBreach: false,
      trackContext: 'B',
      countryContext: 'NO',
    },
    {
      id: 'northwind-retention-1',
      type: 'escalation',
      description: 'Cross-functional retention engagement — Track B portion failure on Senior Migration account',
      state: 'ESCALATING',
      blockerCategory: 'DEEL_INTERNAL',
      ageDays: 0,
      ownerRole: 'VP Operations (cross-functional channel)',
      fiveDayBoundaryBreach: false,
    },
    // Pre-flip actions remain in flight
    {
      id: 'northwind-benefits-1',
      type: 'friction_surface',
      description: 'Benefits substitution review for DE/NL pension plans',
      state: 'ACTING',
      blockerCategory: null,
      ageDays: 4,
      ownerRole: 'Compliance team',
      fiveDayBoundaryBreach: false,
      trackContext: 'A',
      countryContext: 'DE/NL',
    },
    {
      id: 'northwind-payroll-1',
      type: 'friction_surface',
      description: 'Payroll cutoff shift transition — first cycle on new schedule',
      state: 'ACTING',
      blockerCategory: null,
      ageDays: 2,
      ownerRole: 'Migration Lead',
      fiveDayBoundaryBreach: false,
    },
  ],
  customerFacingSLA: { active: true, responseWindowHours: 24, hoursElapsed: 0 },
};

// =====================
// Cohort summary helpers
// =====================

export const cohortStats = {
  total: 12,
  byTier: {
    senior_migration: 2, // Meridian, Northwind
    churn_watch: 3, // Palomar, Pivot, Halfbrick (auto-promoted)
    standard: 7, // Soundtrap, Proof, Layer.ai, Cube, Sphere, Kestrel, Corvus
  },
  byTrackMix: {
    track_a_dominant: 7, // Soundtrap, Proof, Layer.ai, Cube, Sphere, Meridian, Corvus
    mixed: 5, // Halfbrick, Northwind, Kestrel, Palomar, Pivot
    track_b_dominant: 0,
  },
  byHealth: {
    green: 4, // Soundtrap, Proof, Cube, Sphere
    amber: 4, // Meridian, Layer.ai, Kestrel, Corvus
    red: 3, // Halfbrick, Palomar, Pivot
    naAtIntake: 1, // Northwind starts green; flips on demo button
  },
  byDisposition: {
    hold: 1, // Proof
    convert: 9,
    release: 2, // Palomar, Pivot
  },
};
