// src/services/mockData.ts
// Mock data matching the BlueOcean review_output JSON schema

import type { Report } from '@/types';
import { ReportStatus } from '@/types';

export const MOCK_REPORTS: Report[] = [
  {
    id: 'RPT-2026-0601',
    title: 'China Quantum Computing: Strategic Landscape & Investment Outlook',
    version: 'v1.2',
    status: ReportStatus.NeedsHumanReview,
    humanStatus: 'Pending',
    aiScore: 88.8,
    aiGrade: 'Silver',
    commentCount: 0,
    lastUpdated: '2026-06-02T23:37:34',
    publishReady: false,
    aiReview: {
      scores: {
        overall_score: 88.8,
        grade: 'Silver',
        components: {
          research_quality: 92,
          strategic_insight: 90,
          source_quality: 85,
          writing_quality: 95,
          design_quality: 85,
          executive_readiness: 88,
        },
      },
      recommendations: {
        strengths: [
          "Comprehensive overview of China's quantum computing sector",
          'Clear discussion of technological advancements and government funding',
          'Well-articulated investment thesis with risk assessment',
          'Effective use of technical analogies for executive readers',
        ],
        weaknesses: [
          'Limited discussion of commercialization potential and timelines',
          'Lack of quantum software ecosystem analysis',
          'Over-reliance on state funding data; private sector underrepresented',
          'No discussion of quantum hardware supply chain risks',
        ],
        priority_improvements: [
          {
            issue: 'Lack of clear definitions and explanations',
            impact: 'Reduces accessibility for non-technical executive readers',
            suggested_fix: 'Provide clear definitions and explanations of key technical terms',
            priority_level: 'High',
          },
          {
            issue: 'Too technical for non-experts',
            impact: 'Limits audience reach',
            suggested_fix: 'Add executive summary in plain language',
            priority_level: 'Medium',
          },
          {
            issue: 'Missing commercialization timeline',
            impact: 'Investment decisions lack timing anchor',
            suggested_fix: 'Add a scenario-based timeline to 2030',
            priority_level: 'Low',
          },
        ],
        executive_readiness: {
          board_members: true,
          ministers: false,
          ceos: true,
          sovereign_wealth_funds: false,
          senior_executives: true,
          justification:
            'Suitable for board and senior executive readers with energy/tech background. Ministers and SWF audiences require simplified language and stronger GCC relevance framing.',
        },
      },
      dataGaps: [
        '[Medium] Quantum computing market size for financial modeling applications',
        '[Low] Patent citation impact for China vs US comparison',
      ],
      writingFlaws: [
        '[Low] Vague statements in Key Highlights without concrete definitions',
        '[Medium] Unexplained technical jargon in hardware section',
      ],
      strategicGaps: [
        '[High] Missing key challenges in Chinese quantum computing development',
        '[Medium] No leverage strategy for quantum communication strengths',
      ],
      gccGaps: ['Government funding section does not explain relevance to GCC stakeholders'],
    },
    reportContent: {
      brand: 'BlueOcean',
      label: 'Deep Research Report — Confidential',
      date: 'June 2, 2026',
      sections: [
        {
          heading: 'Executive Summary',
          body: `China's quantum computing sector has emerged as a primary strategic focus under the 14th Five-Year Plan, with government funding exceeding $15 billion. Superconducting qubit platforms remain dominant, led by USTC and Origin Quantum, while photonic and topological approaches are gaining traction among academic spinouts.\n\nThe nation leads globally in quantum communication patents and has deployed the world's longest quantum-secured communication backbone (Beijing–Shanghai). However, China trails the US significantly in quantum computing software and algorithmic development, limiting near-term commercial applications.\n\nKey near-term applications are concentrated in financial modeling, drug discovery, and logistics optimization — areas where Chinese cloud providers (Alibaba, Baidu, Huawei) are actively piloting quantum cloud services.`,
        },
        {
          heading: 'Hardware Landscape',
          body: `Superconducting qubit systems dominate China's quantum hardware landscape. USTC's Zuchongzhi processor reached 66-qubit performance in controlled experiments. Origin Quantum, a Hefei-based spinout, offers commercial systems via cloud and on-premise deployments.\n\nPhotonic approaches from Jiuzhang-series processors have demonstrated quantum advantage in Gaussian boson sampling, while topological qubit research remains largely pre-commercial. Error correction rates remain significantly below fault-tolerant thresholds across all platforms.`,
        },
        {
          heading: 'Government Funding & Policy',
          body: `Under the 14th Five-Year Plan (2021–2025), China has allocated over ¥100 billion ($15B+) to quantum technology, with a strong emphasis on quantum communication infrastructure and defense applications.\n\nThe national quantum backbone network covers over 2,000 km of fiber with satellite integration (Micius). Policy direction prioritizes communication security over commercial computing applications, creating a bifurcated development trajectory.`,
        },
        {
          heading: 'Competitive Position vs. US',
          body: `China leads in quantum communication patents (60%+ global share) and government-funded infrastructure. The US leads comprehensively in quantum computing software (Qiskit, Cirq, PennyLane), algorithmic development, error mitigation, and commercial cloud QaaS ecosystem.\n\nIBM, Google, and IonQ collectively outpace China on hardware roadmaps targeting fault-tolerant quantum computing. The talent pipeline asymmetry is growing — US benefits from global talent acquisition while China faces a brain drain risk as leading researchers relocate abroad.`,
        },
        {
          heading: 'Strategic Recommendations',
          body: `1. Monitor SPARC and IBM Condor milestones as calibration benchmarks for China's hardware roadmap.\n2. Engage Origin Quantum and Baidu Quantum as preferred QaaS evaluation partners for financial services use cases.\n3. Track quantum communication policy developments for potential GCC bilateral cooperation opportunities.\n4. Build internal quantum literacy programs now to reduce the talent gap when commercial applications mature (2029–2032 window).`,
        },
        {
          heading: 'Disclaimer',
          isDisclaimer: true,
          body: `This report has been prepared by BlueOcean Research for internal decision-making purposes only. The information contained herein is based on publicly available sources and AI-assisted analysis as of the report date. It does not constitute financial, legal, or investment advice.`,
        },
      ],
    },
    comments: [],
  },
  {
    id: 'RPT-2026-0602',
    title: 'Nuclear Fusion Commercialization: Energy Disruption & Investment Strategy',
    version: 'v1.0',
    status: ReportStatus.AIReviewed,
    humanStatus: 'Not Started',
    aiScore: 85.5,
    aiGrade: 'Silver',
    commentCount: 0,
    lastUpdated: '2026-06-01T17:29:00',
    publishReady: false,
    aiReview: {
      scores: {
        overall_score: 85.5,
        grade: 'Silver',
        components: {
          research_quality: 85,
          strategic_insight: 88,
          source_quality: 80,
          writing_quality: 90,
          design_quality: 85,
          executive_readiness: 85,
        },
      },
      recommendations: {
        strengths: [
          'Strong understanding of nuclear fusion commercialization and strategic implications',
          'Valuable strategic insights into impact on energy markets and geopolitics',
          'Well-written, concise, and accessible to executive readers',
          'Clear and logical structure with actionable recommendations',
        ],
        weaknesses: [
          'Lacks in-depth analysis of specific technical challenges',
          'Does not explicitly cite sources, reducing source quality score',
          'Relies on general industry trends without concrete data or expert quotes',
          'No visual elements to enhance comprehension',
        ],
        priority_improvements: [
          {
            issue: 'Lack of in-depth technical analysis',
            impact: 'Reduces credibility for technical decision-makers',
            suggested_fix: 'Add detailed analysis of tritium breeding, materials resilience, and licensing barriers',
            priority_level: 'High',
          },
          {
            issue: 'Insufficient evidence strength',
            impact: 'Decreases report persuasiveness',
            suggested_fix: 'Incorporate data, statistics, and expert quotes',
            priority_level: 'Medium',
          },
        ],
        executive_readiness: {
          board_members: true,
          ministers: false,
          ceos: true,
          sovereign_wealth_funds: false,
          senior_executives: true,
          justification: 'Suitable for board and C-suite readers with energy industry background.',
        },
      },
      dataGaps: ['[High] No tritium supply chain cost data', '[Medium] Missing LCOE comparison fusion vs fission'],
      writingFlaws: ['[Low] Passive voice in recommendations section'],
      strategicGaps: ['[High] No GCC energy transition linkage'],
      gccGaps: ['No explicit connection to GCC hydrocarbon export strategy'],
    },
    reportContent: {
      brand: 'BlueOcean',
      label: 'Deep Research Report — Confidential',
      date: 'June 1, 2026',
      sections: [
        {
          heading: 'Executive Summary',
          body: `Nuclear fusion is transitioning from a long-term scientific aspiration to a tangible commercial goal. Driven by private investment and advances in high-temperature superconductors, AI-driven plasma control, and additive manufacturing, well-funded ventures including Commonwealth Fusion Systems, TAE Technologies, and Helion Energy are targeting net-energy gain and pilot plants within the next decade.\n\nFusion could achieve cost parity with renewables by the late 2030s under optimistic scenarios, promising near-limitless, carbon-free baseload power that could reshape energy geopolitics.`,
        },
        {
          heading: 'Technology Overview',
          body: `Magnetic confinement fusion (tokamak) remains the dominant approach, with ITER representing the largest international collaboration. Private tokamak ventures are pursuing compact high-field designs enabled by REBCO superconductors.\n\nKey technical barriers: tritium breeding self-sufficiency, plasma-facing materials resilience under neutron bombardment, and regulatory licensing frameworks for fusion reactors.`,
        },
        {
          heading: 'Strategic Implications',
          body: `Energy Security: Fusion baseload could reduce strategic dependence on hydrocarbon-producing regions, with long-term implications for GCC export revenues.\n\nInvestment Opportunity: Early-stage fusion equity (CFS, Helion, TAE) offers high-risk/high-reward exposure. SPARC net-energy demonstration (targeted 2025) is a key de-risking milestone.`,
        },
        {
          heading: 'Disclaimer',
          isDisclaimer: true,
          body: `This report is for internal BlueOcean Research use only. All projections are model-based estimates and subject to significant uncertainty. Not investment advice.`,
        },
      ],
    },
    comments: [],
  },
  {
    id: 'RPT-2026-0603',
    title: 'GCC Sovereign Wealth Fund Digital Transformation Benchmarking',
    version: 'v2.1',
    status: ReportStatus.Approved,
    humanStatus: 'Approved',
    aiScore: 91.2,
    aiGrade: 'Gold',
    commentCount: 3,
    lastUpdated: '2026-06-03T09:15:00',
    publishReady: true,
    aiReview: {
      scores: {
        overall_score: 91.2,
        grade: 'Gold',
        components: {
          research_quality: 93,
          strategic_insight: 92,
          source_quality: 88,
          writing_quality: 94,
          design_quality: 90,
          executive_readiness: 92,
        },
      },
      recommendations: {
        strengths: [
          'Comprehensive benchmarking across 6 major GCC sovereign wealth funds',
          'Original primary research with direct fund interviews',
          'Clear strategic recommendations tailored to regional context',
          'Strong executive readiness with minister-level language',
        ],
        weaknesses: [
          'Limited peer comparison outside GCC (Norway GPFG, Singapore Temasek)',
          'Technology adoption metrics rely on self-reported data',
        ],
        priority_improvements: [
          {
            issue: 'No global peer comparison',
            impact: 'Limits contextual benchmarking',
            suggested_fix: 'Add comparative table: ADIA, QIA, PIF vs GPFG, GIC, Temasek',
            priority_level: 'Medium',
          },
        ],
        executive_readiness: {
          board_members: true,
          ministers: true,
          ceos: true,
          sovereign_wealth_funds: true,
          senior_executives: true,
          justification: 'Gold-grade executive readiness. Suitable for all target audiences.',
        },
      },
      dataGaps: [],
      writingFlaws: [],
      strategicGaps: [],
      gccGaps: [],
    },
    reportContent: {
      brand: 'BlueOcean',
      label: 'Deep Research Report — Confidential',
      date: 'June 3, 2026',
      sections: [
        {
          heading: 'Executive Summary',
          body: `GCC sovereign wealth funds are rapidly advancing their digital transformation agendas, with cumulative technology investment exceeding $8 billion across ADIA, QIA, PIF, Mubadala, ADQ, and ICD in 2025.\n\nKey transformation pillars include AI-driven portfolio analytics, cloud infrastructure migration, ESG data platforms, and digital asset custody. PIF leads on innovation velocity; ADIA leads on technology governance maturity.`,
        },
        {
          heading: 'Key Findings',
          body: `PIF ranks highest in AI adoption velocity, driven by Vision 2030 mandate and $1B+ technology investment runway. ADIA leads in governance maturity with the most robust digital risk and compliance framework.\n\nCommon gaps across all funds: quantum computing readiness, real-time portfolio risk analytics, and ESG data standardization.`,
        },
        {
          heading: 'Strategic Recommendations',
          body: `1. Establish a GCC SWF Technology Working Group to share non-competitive best practices.\n2. Prioritize quantum computing exploration programs now, targeting commercial readiness by 2030.\n3. Standardize ESG data collection across portfolio companies to enable fund-level reporting by 2027.`,
        },
        {
          heading: 'Disclaimer',
          isDisclaimer: true,
          body: `Prepared for internal use. Interview data has been anonymized per participant agreements.`,
        },
      ],
    },
    comments: [
      {
        id: 'c1',
        reportId: 'RPT-2026-0603',
        version: 'v2.1',
        section: 'Key Findings',
        text: 'Add GPFG and GIC as comparison benchmarks. The absence of global peers weakens the contextual framing.',
        priority: 'Medium',
        reviewer: 'Senior Reviewer',
        timestamp: '2026-06-03T08:45:00',
        status: 'resolved',
      },
      {
        id: 'c2',
        reportId: 'RPT-2026-0603',
        version: 'v2.1',
        section: 'Strategic Recommendations',
        text: 'Recommendation 4 on AI CoE needs budget range estimates to be actionable.',
        priority: 'High',
        reviewer: 'Senior Reviewer',
        timestamp: '2026-06-03T08:52:00',
        status: 'resolved',
      },
      {
        id: 'c3',
        reportId: 'RPT-2026-0603',
        version: 'v2.1',
        section: 'Executive Summary',
        text: 'The $8B figure needs a footnote or inline citation.',
        priority: 'Low',
        reviewer: 'Senior Reviewer',
        timestamp: '2026-06-03T09:01:00',
        status: 'resolved',
      },
    ],
  },
  {
    id: 'RPT-2026-0604',
    title: 'GCC AI Regulation Landscape: Policy Gaps and Opportunity Map',
    version: 'v1.0',
    status: ReportStatus.Approved,
    humanStatus: 'Approved',
    aiScore: 78.4,
    aiGrade: 'Bronze',
    commentCount: 1,
    lastUpdated: '2026-06-04T10:30:00',
    publishReady: true,
    aiReview: {
      scores: {
        overall_score: 78.4,
        grade: 'Bronze',
        components: {
          research_quality: 80,
          strategic_insight: 82,
          source_quality: 72,
          writing_quality: 85,
          design_quality: 75,
          executive_readiness: 76,
        },
      },
      recommendations: {
        strengths: [
          'Timely topic with strong regional policy relevance',
          'Good coverage of UAE, Saudi Arabia, and Qatar regulatory frameworks',
          'Actionable gap analysis for policy stakeholders',
        ],
        weaknesses: [
          'Limited coverage of Bahrain, Kuwait, Oman AI policy developments',
          'No comparative analysis with EU AI Act or US NIST framework',
        ],
        priority_improvements: [
          {
            issue: 'Incomplete GCC coverage',
            impact: 'Report appears UAE/Saudi-centric',
            suggested_fix: 'Add section on Bahrain AI sandbox and Oman digital economy strategy',
            priority_level: 'High',
          },
        ],
        executive_readiness: {
          board_members: true,
          ministers: true,
          ceos: false,
          sovereign_wealth_funds: false,
          senior_executives: true,
          justification: 'Suitable for ministerial and board audiences. CEO audience requires more quantitative business impact framing.',
        },
      },
      dataGaps: ['[High] No enforcement data or penalty case studies'],
      writingFlaws: ['[Medium] Overuse of passive voice in policy analysis sections'],
      strategicGaps: ['[High] No recommended policy harmonization roadmap'],
      gccGaps: [],
    },
    reportContent: {
      brand: 'BlueOcean',
      label: 'Deep Research Report — Confidential',
      date: 'June 4, 2026',
      sections: [
        {
          heading: 'Executive Summary',
          body: `The GCC is experiencing a divergent AI regulatory environment, with the UAE pioneering a pro-innovation, principles-based framework while Saudi Arabia is developing sector-specific guidance under SDAIA.\n\nThis policy fragmentation creates compliance complexity for multinational technology firms operating across GCC markets and presents an opportunity for regional harmonization leadership.`,
        },
        {
          heading: 'Regulatory Landscape',
          body: `UAE: The UAE AI Office has published a voluntary AI Ethics Framework and is developing mandatory sectoral guidelines for healthcare and finance AI applications.\n\nSaudi Arabia: SDAIA's national AI strategy includes regulatory components. Financial sector AI governance is overseen by SAMA with guidance issued in 2024.`,
        },
        {
          heading: 'Disclaimer',
          isDisclaimer: true,
          body: `Policy landscape is subject to rapid change. Verify regulatory status before any compliance-based decisions.`,
        },
      ],
    },
    comments: [
      {
        id: 'c4',
        reportId: 'RPT-2026-0604',
        version: 'v1.0',
        section: 'Regulatory Landscape',
        text: 'Expand Bahrain and Oman coverage — currently UAE/KSA only which is not representative of the full GCC.',
        priority: 'High',
        reviewer: 'Senior Reviewer',
        timestamp: '2026-06-04T09:30:00',
        status: 'sent to regeneration',
      },
    ],
  },
  {
    id: 'RPT-2026-0605',
    title: 'Global Semiconductor Supply Chain: Resilience Strategies Post-2025 Export Controls',
    version: 'v1.3',
    status: ReportStatus.NeedsRevision,
    humanStatus: 'Needs Revision',
    aiScore: 72.1,
    aiGrade: 'Bronze',
    commentCount: 4,
    lastUpdated: '2026-06-01T14:20:00',
    publishReady: false,
    aiReview: {
      scores: {
        overall_score: 72.1,
        grade: 'Bronze',
        components: {
          research_quality: 75,
          strategic_insight: 78,
          source_quality: 65,
          writing_quality: 80,
          design_quality: 70,
          executive_readiness: 65,
        },
      },
      recommendations: {
        strengths: [
          'Comprehensive mapping of key export control provisions',
          'Good identification of alternative sourcing geographies',
        ],
        weaknesses: [
          'Analysis is heavily US-centric; missing European and Japanese supplier perspectives',
          'No financial impact quantification of supply chain disruption scenarios',
          'Data as of Q3 2024 — may be stale given rapid regulatory changes',
        ],
        priority_improvements: [
          {
            issue: 'US-centric analysis',
            impact: 'Misses critical ASML, TSMC, Tokyo Electron supply chain dependencies',
            suggested_fix: 'Add European and Japanese supplier vulnerability analysis',
            priority_level: 'High',
          },
          {
            issue: 'No financial scenario modeling',
            impact: 'Decision-makers cannot quantify risk',
            suggested_fix: 'Build 3-scenario supply chain cost model (base, adverse, severe)',
            priority_level: 'High',
          },
        ],
        executive_readiness: {
          board_members: false,
          ministers: false,
          ceos: false,
          sovereign_wealth_funds: false,
          senior_executives: true,
          justification: 'Currently suitable only for senior technical/operational executives.',
        },
      },
      dataGaps: ['[High] No TSMC advanced node allocation data post-2025 rules'],
      writingFlaws: ['[High] Executive summary uses technical acronyms without explanation'],
      strategicGaps: ['[High] No GCC investment opportunity framing in semiconductor supply chain'],
      gccGaps: ['No connection to KSA Vision 2030 semiconductor aspirations'],
    },
    reportContent: {
      brand: 'BlueOcean',
      label: 'Deep Research Report — DRAFT — Internal Use Only',
      date: 'June 1, 2026',
      sections: [
        {
          heading: 'Executive Summary',
          body: `[DRAFT — Requires revision] The 2023–2025 US BIS export control regime has created significant fragmentation in global semiconductor supply chains. Advanced logic chips (sub-7nm), HBM memory, and EDA software now face layered export restrictions targeting China.`,
        },
        {
          heading: 'Export Control Framework',
          body: `The October 2023 and November 2024 BIS rule updates expanded restrictions to cover advanced AI chips, HBM memory, semiconductor manufacturing equipment, and EDA tools. TSMC, Samsung, and SK Hynix have implemented compliance programs.`,
        },
        {
          heading: 'Disclaimer',
          isDisclaimer: true,
          body: `DRAFT report. Do not distribute. BlueOcean internal research only.`,
        },
      ],
    },
    comments: [
      {
        id: 'c5',
        reportId: 'RPT-2026-0605',
        version: 'v1.3',
        section: 'Executive Summary',
        text: 'This executive summary needs a complete rewrite — remove all acronyms or spell them out.',
        priority: 'High',
        reviewer: 'Senior Reviewer',
        timestamp: '2026-06-01T12:30:00',
        status: 'sent to regeneration',
      },
      {
        id: 'c6',
        reportId: 'RPT-2026-0605',
        version: 'v1.3',
        section: 'Executive Summary',
        text: 'Add European and Japanese supplier analysis. ASML is barely mentioned.',
        priority: 'High',
        reviewer: 'Senior Reviewer',
        timestamp: '2026-06-01T12:38:00',
        status: 'sent to regeneration',
      },
      {
        id: 'c7',
        reportId: 'RPT-2026-0605',
        version: 'v1.3',
        section: 'Executive Summary',
        text: 'Need 3-scenario financial model for supply chain cost impact.',
        priority: 'High',
        reviewer: 'Senior Reviewer',
        timestamp: '2026-06-01T12:45:00',
        status: 'sent to regeneration',
      },
      {
        id: 'c8',
        reportId: 'RPT-2026-0605',
        version: 'v1.3',
        section: 'Export Control Framework',
        text: 'Data is stale — update to reflect November 2025 BIS amendments.',
        priority: 'High',
        reviewer: 'Senior Reviewer',
        timestamp: '2026-06-01T12:52:00',
        status: 'open',
      },
    ],
  },
  {
    id: 'RPT-2026-0606',
    title: 'Emerging Market Digital Banking: GCC Fintech Opportunity Sizing',
    version: 'v1.0',
    status: ReportStatus.Generated,
    humanStatus: 'Not Started',
    aiScore: 0,
    aiGrade: '—',
    commentCount: 0,
    lastUpdated: '2026-06-04T18:00:00',
    publishReady: false,
    aiReview: null,
    reportContent: {
      brand: 'BlueOcean',
      label: 'Deep Research Report — Confidential',
      date: 'June 4, 2026',
      sections: [
        {
          heading: 'Executive Summary',
          body: `GCC fintech is undergoing rapid transformation driven by regulatory innovation (ADGM, DIFC FinTech hive), smartphone penetration exceeding 95%, and a young demographic skew toward digital-first banking.\n\nTotal addressable market for digital banking services in GCC is estimated at $45B by 2030.`,
        },
        {
          heading: 'Market Overview',
          body: `UAE leads GCC fintech with 50+ licensed fintechs in DIFC and ADGM. Saudi Arabia's Vision 2030 financial sector development program has catalyzed 60%+ growth in fintech registrations since 2022.`,
        },
        { heading: 'Disclaimer', isDisclaimer: true, body: `BlueOcean Research. Internal use only. AI-generated draft, pending human review.` },
      ],
    },
    comments: [],
  },
  {
    id: 'RPT-2026-0607',
    title: 'Climate Tech Investment: MENA Carbon Market Development',
    version: 'v1.1',
    status: ReportStatus.Published,
    humanStatus: 'Approved',
    aiScore: 89.5,
    aiGrade: 'Silver',
    commentCount: 2,
    lastUpdated: '2026-06-02T11:00:00',
    publishReady: true,
    aiReview: {
      scores: {
        overall_score: 89.5,
        grade: 'Silver',
        components: {
          research_quality: 90,
          strategic_insight: 91,
          source_quality: 86,
          writing_quality: 92,
          design_quality: 88,
          executive_readiness: 90,
        },
      },
      recommendations: {
        strengths: [
          'Timely analysis aligned with COP29 agenda',
          'Strong quantitative market sizing with scenario modeling',
          'Excellent GCC relevance framing throughout',
        ],
        weaknesses: [
          'Voluntary carbon market integrity concerns not addressed',
          'No analysis of Article 6 Paris Agreement implications',
        ],
        priority_improvements: [
          {
            issue: 'Carbon credit quality/integrity gap',
            impact: 'Recommendations may lead to reputational risk for investors',
            suggested_fix: 'Add section on additionality standards and ICVCM Core Carbon Principles',
            priority_level: 'Medium',
          },
        ],
        executive_readiness: {
          board_members: true,
          ministers: true,
          ceos: true,
          sovereign_wealth_funds: true,
          senior_executives: true,
          justification: 'Excellent executive readiness. Suitable for all target audiences.',
        },
      },
      dataGaps: [],
      writingFlaws: [],
      strategicGaps: [],
      gccGaps: [],
    },
    reportContent: {
      brand: 'BlueOcean',
      label: 'Deep Research Report — Confidential',
      date: 'June 2, 2026',
      sections: [
        {
          heading: 'Executive Summary',
          body: `The MENA voluntary carbon market is projected to reach $2.5B by 2030, driven by Saudi Arabia's PIF net-zero commitments, UAE Carbon Credits Exchange launch, and growing multinational demand for credible MENA-sourced offsets.`,
        },
        {
          heading: 'Market Sizing',
          body: `Current MENA voluntary carbon market: ~$180M (2025). Base case projection: $1.2B (2027), $2.5B (2030). Bull case: $4B (2030) driven by Article 6 bilateral agreements.`,
        },
        { heading: 'Disclaimer', isDisclaimer: true, body: `BlueOcean Research. Published report — June 2026.` },
      ],
    },
    comments: [
      {
        id: 'c9',
        reportId: 'RPT-2026-0607',
        version: 'v1.1',
        section: 'Market Sizing',
        text: 'Bull case of $4B needs to be caveated more prominently.',
        priority: 'Medium',
        reviewer: 'Senior Reviewer',
        timestamp: '2026-06-02T10:15:00',
        status: 'resolved',
      },
      {
        id: 'c10',
        reportId: 'RPT-2026-0607',
        version: 'v1.1',
        section: 'Executive Summary',
        text: 'Excellent framing. Approved for publication.',
        priority: 'Low',
        reviewer: 'Senior Reviewer',
        timestamp: '2026-06-02T10:45:00',
        status: 'resolved',
      },
    ],
  },
  {
    id: 'RPT-2026-0608',
    title: 'Deep Tech VC: Portfolio Construction for Emerging Market Investors',
    version: 'v1.0',
    status: ReportStatus.NeedsHumanReview,
    humanStatus: 'In Progress',
    aiScore: 83.7,
    aiGrade: 'Silver',
    commentCount: 1,
    lastUpdated: '2026-06-04T16:00:00',
    publishReady: false,
    aiReview: {
      scores: {
        overall_score: 83.7,
        grade: 'Silver',
        components: {
          research_quality: 85,
          strategic_insight: 87,
          source_quality: 80,
          writing_quality: 88,
          design_quality: 82,
          executive_readiness: 80,
        },
      },
      recommendations: {
        strengths: [
          'Strong portfolio construction framework with EM context',
          'Clear risk-adjusted return modeling across deep tech verticals',
          'Good GCC investor perspective integration',
        ],
        weaknesses: [
          'Limited discussion of currency hedging for EM deep tech investments',
          'No analysis of co-investment structures with US/European VC',
        ],
        priority_improvements: [
          {
            issue: 'Currency risk not addressed',
            impact: 'GCC investors face significant FX exposure',
            suggested_fix: 'Add section on hedging strategies and currency risk quantification',
            priority_level: 'High',
          },
        ],
        executive_readiness: {
          board_members: true,
          ministers: false,
          ceos: true,
          sovereign_wealth_funds: true,
          senior_executives: true,
          justification: 'Suitable for board, CEO, and SWF audiences.',
        },
      },
      dataGaps: ['[Medium] No EM deep tech IRR benchmark data vs global VC'],
      writingFlaws: ['[Low] Section 4 conclusion paragraph is redundant'],
      strategicGaps: ['[Medium] Co-investment structures with tier-1 VCs not analyzed'],
      gccGaps: [],
    },
    reportContent: {
      brand: 'BlueOcean',
      label: 'Deep Research Report — Confidential',
      date: 'June 4, 2026',
      sections: [
        {
          heading: 'Executive Summary',
          body: `Deep technology venture capital is experiencing a bifurcation: tier-1 US and European funds are increasingly inaccessible to emerging market LPs, while regional deep tech ecosystems in MENA, Southeast Asia, and India are generating independent deal flow with risk-return profiles comparable to Series A/B global benchmarks.`,
        },
        {
          heading: 'Portfolio Construction Framework',
          body: `Recommended allocation: 40% global tier-1 co-investments, 35% regional champions (MENA, India, SEA), 25% early-stage local ecosystem (UAE, KSA, Qatar).\n\nRisk-adjusted return target: 18% net IRR over 10-year horizon at 2.5× MOIC.`,
        },
        { heading: 'Disclaimer', isDisclaimer: true, body: `BlueOcean Research. Internal use only. Not investment advice.` },
      ],
    },
    comments: [
      {
        id: 'c11',
        reportId: 'RPT-2026-0608',
        version: 'v1.0',
        section: 'Portfolio Construction Framework',
        text: 'The 18% net IRR target needs a benchmark comparison — what is the EM PE/VC average?',
        priority: 'Medium',
        reviewer: 'Senior Reviewer',
        timestamp: '2026-06-04T15:30:00',
        status: 'open',
      },
    ],
  },
  {
    id: 'RPT-2026-0609',
    title: 'China Private Equity Market: Navigating a Bifurcated Landscape Amid Regulatory and Economic Shifts',
    version: 'v1.0',
    status: ReportStatus.NeedsHumanReview,
    humanStatus: 'Pending',
    aiScore: 72.0,
    aiGrade: 'Bronze',
    commentCount: 0,
    lastUpdated: '2026-06-10T08:44:10',
    publishReady: false,
    aiReview: {
      scores: {
        overall_score: 72.0,
        grade: 'Bronze',
        components: {
          research_quality: 80,
          strategic_insight: 72,
          source_quality: 56,
          writing_quality: 80,
          design_quality: 75,
          executive_readiness: 60,
        },
      },
      recommendations: {
        strengths: [
          "The report provides a comprehensive analysis of the China private equity market, covering key trends, regulatory changes, and sector dynamics, as seen in the section 'China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy'",
          "The report offers a detailed examination of the shift in deal activity toward technology, healthcare, and green energy sectors, including specific examples and data, as discussed in 'Deal Activity Is Shifting Toward Technology, Healthcare, and Green Energy Sectors'",
          "The analysis of exit channels, including IPO markets, trade sales, and secondary transactions, is thorough and well-supported, as presented in 'Exit Channels Are Constrained by Weak IPO Markets and Geopolitical Uncertainty'",
          "The report cites specific data and statistics, such as the $1.5 trillion AUM of the China private equity market and the 30% decline in fundraising, to support its claims",
          "The analysis of sector trends, including the growth of technology, healthcare, and green energy, is backed by examples and data, as seen in 'Deal Activity Is Shifting Toward Technology, Healthcare, and Green Energy Sectors'",
          "The report provides clear implications for investors, including the need to adapt to a bifurcated market and to focus on niche sectors like advanced manufacturing, biotech, and energy transition",
          "The analysis of exit channels offers actionable recommendations for investors, such as exploring alternative exit routes and managing portfolio risk",
          "The report is well-organized, with clear section titles and a logical flow of ideas",
          "The writing is clear and concise, making it easy to follow the analysis and recommendations"
        ],
        weaknesses: [
          "Lack of deeper analysis on the impact of geopolitical tensions on the private equity market\nLocation → [China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy] | Para 4 |\n\"Geopolitical tensions, particularly between the US and China, have further complicated the landscape.\" → \"For PE investors, these tensions create both risks and opportunities.\"",
          "Insufficient discussion on the role of government guidance funds in shaping the private equity market\nLocation → [Fundraising Has Slowed but AUM Continues to Grow as Existing Funds Deploy Capital] | Para 2 |\n\"Government guidance funds, which are state-backed investment vehicles, have become a significant source of capital, particularly for funds focused on strategic sectors like semiconductors, AI, and renewable energy.\" → \"These funds often come with policy objectives, such as promoting local economic development or supporting national priorities, which can influence investment decisions.\"",
          "Lack of named sources to support key claims, such as the impact of regulatory changes on the private equity market\nLocation → [China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy] | Para 3 |\n\"Regulatory changes have been a defining feature of the market since 2020.\" → \"These regulations impose stricter requirements on data handling, antitrust reviews for large deals, and foreign investment screening in sensitive sectors.\"",
          "Absence of a bibliography or traceable sources for statistics and data, such as the $400 billion 'dry powder' estimate\nLocation → [Fundraising Has Slowed but AUM Continues to Grow as Existing Funds Deploy Capital] | Para 3 |\n\"This dry powder provides a cushion for future dealmaking but also creates pressure to deploy capital in a market where valuations remain elevated in certain sectors.\" → \"The competition for quality assets is intense, particularly in technology and healthcare, where valuations have not corrected as much as in other sectors.\"",
          "Lack of explicit decision implications for specific investor groups, such as sovereign wealth funds or pension funds\nLocation → [Fundraising Has Slowed but AUM Continues to Grow as Existing Funds Deploy Capital] | Para 1 |\n\"LPs are increasingly concerned about regulatory unpredictability, geopolitical risks, and the economic slowdown.\" → \"A survey by Coller Capital in 2024 found that 45% of institutional investors plan to reduce their China PE allocation over the next two years, up from 30% in 2022.\"",
          "Insufficient discussion on the potential risks and opportunities associated with the shift in deal activity toward technology, healthcare, and green energy sectors\nLocation → [Deal Activity Is Shifting Toward Technology, Healthcare, and Green Energy Sectors] | Para 1 |\n\"The technology sector remains the largest and most dynamic area for PE investment in China.\" → \"Within technology, semiconductors and AI are the top sub-sectors, driven by government initiatives to achieve self-sufficiency and reduce dependence on foreign technology.\"",
          "Some sections, such as 'China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy', are overly long and could be broken up for easier reading\nLocation → [China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy] | Para 1-4",
          "The report could benefit from more visual aids, such as charts or graphs, to illustrate key trends and data\nLocation → [Deal Activity Is Shifting Toward Technology, Healthcare, and Green Energy Sectors] | Para 1-4"
        ],
        priority_improvements: [
          {
            issue: "[CRITICAL] Lack of clear implications for investors or policymakers in Key highlights",
            impact: "Enhanced strategic value for investors and policymakers.",
            suggested_fix: "Add a section detailing specific investment strategies or policy recommendations based on the market analysis.",
            priority_level: "High"
          },
          {
            issue: "[HIGH] Data gaps on structural shifts in China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy",
            impact: "Increased credibility of market analysis.",
            suggested_fix: "Include specific data on structural shifts, such as changes in regulatory environments or market trends, to support claims.",
            priority_level: "High"
          },
          {
            issue: "[HIGH] Lack of concrete data supporting the forecast for 2025 in Key highlights",
            impact: "Improved reliability of forecasts.",
            suggested_fix: "Add concrete data or research findings that support the forecast, such as historical market trends or economic indicators.",
            priority_level: "High"
          },
          {
            issue: "[HIGH] Lack of diverse sources and references in Disclaimer",
            impact: "Enhanced credibility and authority of the report.",
            suggested_fix: "Incorporate a variety of sources, including academic research, industry reports, and news articles, to enhance the credibility of the report.",
            priority_level: "High"
          },
          {
            issue: "[MEDIUM] Vague statement about the market being in 'a more mature phase' in China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy",
            impact: "Clearer understanding of market development stage.",
            suggested_fix: "Define what is meant by 'a more mature phase', including specific characteristics or benchmarks.",
            priority_level: "Medium"
          },
          {
            issue: "[MEDIUM] Overloaded sentence structure in China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy",
            impact: "Improved readability and comprehension.",
            suggested_fix: "Break long sentences into simpler, shorter ones to improve readability.",
            priority_level: "Medium"
          },
          {
            issue: "[MEDIUM] Abrupt transition from discussing market trends to regulatory changes in China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy",
            impact: "Smoothened narrative flow and better cohesion.",
            suggested_fix: "Use transitional phrases or sentences to connect ideas and improve the flow of the narrative.",
            priority_level: "Medium"
          },
          {
            issue: "[LOW] Minor formatting inconsistencies in Key highlights",
            impact: "Polished and professional appearance.",
            suggested_fix: "Standardize formatting throughout the report to improve visual consistency.",
            priority_level: "Low"
          }
        ],
        executive_readiness: {
          board_members: false,
          ministers: false,
          ceos: false,
          sovereign_wealth_funds: false,
          senior_executives: false,
          justification: "Minister Ready: NO — The report lacks actionable advice for policymakers and contains high-severity gaps in data and evidence. Board Ready: NO — The report's strategic gaps, particularly the lack of clear implications for investors, hinder its readiness for the board. SWF Ready: NO — Similar to the minister and board, the report's lack of concrete data and strategic gaps make it unready for SWF audiences."
        }
      },
      dataGaps: [
        "[High] [China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy] The decline in fundraising from the 2021 peak is not merely cyclical but reflects structural shifts\n- Missing: Specific data on structural shifts, Comparison to previous market cycles\nLocation → [China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy] | Para 1 |\n\"The Chinese private\" → \"more mature phase\""
      ],
      writingFlaws: [
        "[Medium] vague_statement\n- Example: _\"a more mature phase\"_\n- Fix: Define what is meant by 'a more mature phase'\nLocation → [China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy] | Para 1 |\n\"The Chinese private\" → \"more mature phase\"",
        "[High] overloaded_sentence\n- Example: _\"The Chinese private equity market has experienced a remarkable growth trajectory over the past decade, with AUM expanding from approximately $500 billion in 2015 to over $1.5 trillion in 2024, supported by a vibrant startup ecosystem, particularly in technology and healthcare, and by government initiatives such as the 'Mass Entrepreneurship and Innovation' campaign.\"_\n- Fix: Break the sentence into two or three simpler sentences\nLocation → [China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy] | Para 1 |\n\"The Chinese private\" → \"Innovation' campaign\""
      ],
      strategicGaps: [
        "[Critical] Lack of clear implications for investors or policymakers\nLocation → [Key highlights] | Para 1 |\n\"China's private equity\" → \"cautious stance\"",
        "[High] The outlook for 2025 suggests a bifurcated market where selective opportunities exist in niche sectors\n- Missing evidence: Concrete data or research supporting the forecast for 2025\nLocation → [Key highlights] | Para 1 |\n\"The outlook for\" → \"moderate growth\"",
        "[Medium] Abrupt transition from discussing market trends to regulatory changes\nLocation → [China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy] | Para 3 |\n\"Regulatory changes\" → \"national security\""
      ],
      gccGaps: [
        "[High] Lack of actionable advice for policymakers\nLocation → [Disclaimer] | Para 1 |\n\"This document\" → \"strategy discussion only\""
      ],
    },
    reportContent: {
      brand: 'BlueOcean',
      label: 'Deep Research Report — Confidential',
      date: 'June 10, 2026',
      sections: [
        {
          heading: 'Key highlights',
          body: `China's private equity market remains one of the largest globally, with AUM exceeding $1.5 trillion as of 2024, but the market is undergoing a structural transformation. Fundraising has slowed sharply from the 2021 peak, declining by approximately 30% year-on-year in 2023-2024, as LPs adopt a cautious stance due to regulatory uncertainty, geopolitical tensions, and a slowing domestic economy. Deal activity is shifting away from consumer internet and real estate toward technology, healthcare, and green energy, which now account for over 60% of total deal value. Exit channels are constrained: IPO volumes onshore and offshore have dropped significantly, trade sales and secondary transactions are gaining share but remain underdeveloped. Domestic PE firms, such as Hillhouse and CDH, have increased their market share to over 70% of fundraising, while global players face new barriers from data security reviews and antitrust enforcement. LP sentiment is bifurcated: some institutional investors are reducing exposure, but top-tier managers with strong track records continue to attract capital. Key risks include geopolitical escalation, prolonged economic slowdown, and liquidity constraints from capital controls. The outlook for 2025 suggests a bifurcated market where selective opportunities exist in niche sectors like advanced manufacturing, biotech, and energy transition, but overall growth will be moderate. This report provides a data-driven analysis of market size, regulatory changes, sector dynamics, competitive landscape, and risk factors to inform strategic allocation decisions.`,
        },
        {
          heading: 'Contents',
          body: `- China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy\n- Fundraising Has Slowed but AUM Continues to Grow as Existing Funds Deploy Capital\n- Deal Activity Is Shifting Toward Technology, Healthcare, and Green Energy Sectors\n- Exit Channels Are Constrained by Weak IPO Markets and Geopolitical Uncertainty`,
        },
        {
          heading: 'Disclaimer',
          isDisclaimer: true,
          body: `This document is a management consulting and research analysis deliverable for strategy discussion only. It is not professional advisory guidance.`,
        },
        {
          heading: 'China Private Equity Market Remains Large but Faces Headwinds from Regulation and Economy',
          body: `The Chinese private equity market has experienced a remarkable growth trajectory over the past decade, with AUM expanding from approximately $500 billion in 2015 to over $1.5 trillion in 2024. This growth has been supported by a vibrant startup ecosystem, particularly in technology and healthcare, and by government initiatives such as the 'Mass Entrepreneurship and Innovation' campaign. However, the market is now entering a more mature phase, characterized by slower fundraising, more selective dealmaking, and a challenging exit environment. The decline in fundraising from the 2021 peak is not merely cyclical but reflects structural shifts, including increased regulatory oversight and a more cautious LP base. For instance, the number of funds closed in 2024 is expected to be 30% lower than in 2021, with average fund sizes also shrinking as LPs prefer smaller, more focused vehicles.\n\nThe economic backdrop adds further complexity. China's GDP growth has slowed to around 4.5% in 2024, down from 5.2% in 2023, and deflationary pressures are evident in producer prices. The property sector, a major driver of past growth, remains in a prolonged downturn, with ripple effects across related industries. Corporate defaults have increased, particularly among highly leveraged firms, and local government financing vehicles face liquidity strains. These macroeconomic headwinds directly impact PE portfolios, depressing valuations and extending holding periods. Nevertheless, certain sectors such as advanced manufacturing, renewable energy, and biotech continue to attract strong interest, driven by government policy and structural demand.\n\nRegulatory changes have been a defining feature of the market since 2020. The introduction of the Data Security Law (DSL), the Personal Information Protection Law (PIPL), and the Anti-Monopoly Guidelines have reshaped the operating environment for PE investors. These regulations impose stricter requirements on data handling, antitrust reviews for large deals, and foreign investment screening in sensitive sectors. While these rules aim to enhance national security and market order, they have also increased compliance costs and deal uncertainty. For example, the antitrust review process for large transactions can now take 6-12 months, compared to 3-6 months previously. Foreign investors face additional scrutiny under the Foreign Investment Security Review (FISR) mechanism, which covers sectors such as critical infrastructure, data security, and defense. As a result, some global PE firms have reduced their China exposure, while domestic firms have stepped in to fill the gap.\n\nGeopolitical tensions, particularly between the US and China, have further complicated the landscape. Technology export controls, sanctions on certain Chinese companies, and restrictions on capital flows have limited cross-border dealmaking. The US CHIPS Act and similar measures in Europe have also encouraged a shift in supply chains away from China, affecting sectors like semiconductors and electronics. For PE investors, these tensions create both risks and opportunities. On one hand, they increase uncertainty and may limit exit options, especially for companies reliant on US capital markets. On the other hand, they create opportunities for domestic substitution and for investments in companies that benefit from government self-sufficiency initiatives. The net effect is a market that is more complex but still offers significant potential for those with deep local knowledge and a long-term perspective.`,
        },
        {
          heading: 'Fundraising Has Slowed but AUM Continues to Grow as Existing Funds Deploy Capital',
          body: `LPs are increasingly concerned about regulatory unpredictability, geopolitical risks, and the economic slowdown. A survey by Coller Capital in 2024 found that 45% of institutional investors plan to reduce their China PE allocation over the next two years, up from 30% in 2022. However, this sentiment is not uniform: sovereign wealth funds and pension funds from Asia and the Middle East continue to see China as a strategic market and are maintaining or even increasing allocations. For example, the Abu Dhabi Investment Authority (ADIA) and Singapore's GIC have been active in China PE, focusing on sectors like technology and healthcare. The divergence in LP behavior is creating a bifurcated market where top-tier funds can still raise capital, while others struggle.\n\nThe composition of fundraising is also shifting. Domestic currency funds (RMB funds) now account for over 70% of total fundraising, up from 60% in 2020. This shift reflects the growing importance of domestic LPs, including insurance companies, pension funds, and wealthy individuals, as well as the relative decline of foreign capital. Government guidance funds, which are state-backed investment vehicles, have become a significant source of capital, particularly for funds focused on strategic sectors like semiconductors, AI, and renewable energy. These funds often come with policy objectives, such as promoting local economic development or supporting national priorities, which can influence investment decisions. For foreign GPs, raising RMB funds has become increasingly important to access local opportunities, but it also requires navigating complex regulatory and partnership structures.\n\nThe deployment of capital has also slowed, with many funds extending their investment periods. The average time to deploy a fund has increased from 3-4 years to 4-5 years, as GPs exercise greater caution in a challenging deal environment. This has led to a buildup of 'dry powder' (committed but uninvested capital), which is estimated at over $400 billion as of mid-2024. This dry powder provides a cushion for future dealmaking but also creates pressure to deploy capital in a market where valuations remain elevated in certain sectors. The competition for quality assets is intense, particularly in technology and healthcare, where valuations have not corrected as much as in other sectors. As a result, GPs are increasingly focusing on operational improvements and value creation to generate returns, rather than relying solely on multiple expansion or IPO exits.\n\nLooking ahead, fundraising is expected to remain subdued in 2025, with total commitments likely in the range of $150-180 billion. The market will continue to be bifurcated, with top-tier managers able to raise capital but at smaller fund sizes, while weaker managers may struggle to close. LPs will demand greater transparency, stronger track records, and clearer exit strategies. The trend toward RMB funds is likely to continue, as domestic LPs become more sophisticated and as government guidance funds play a larger role. For foreign GPs, the key to successful fundraising will be demonstrating deep local expertise, strong relationships with regulators, and a clear strategy for navigating the complex environment. Overall, while the fundraising environment is challenging, it is not uniformly negative, and opportunities exist for those who can adapt.`,
        },
        {
          heading: 'Deal Activity Is Shifting Toward Technology, Healthcare, and Green Energy Sectors',
          body: `The technology sector remains the largest and most dynamic area for PE investment in China. Within technology, semiconductors and AI are the top sub-sectors, driven by government initiatives to achieve self-sufficiency and reduce dependence on foreign technology. The National Integrated Circuit Industry Investment Fund (the 'Big Fund') has committed over $50 billion to semiconductor projects, and PE funds are co-investing alongside it. AI startups, particularly in areas like computer vision, natural language processing, and autonomous driving, continue to attract significant capital, despite regulatory scrutiny on data usage. However, the sector is not without risks: valuations are high, and the exit environment for tech companies is challenging due to restrictions on IPOs in the US and a crowded domestic IPO pipeline. GPs are increasingly focusing on later-stage companies with clear revenue models and paths to profitability.\n\nHealthcare has emerged as a resilient and high-growth sector for PE investment. China's aging population, rising healthcare spending, and government support for innovation are driving demand for new drugs, medical devices, and healthcare services. Biotech is a particular focus, with many Chinese companies developing novel therapies for cancer, autoimmune diseases, and rare diseases. PE investors are also active in healthcare services, including hospitals, clinics, and digital health platforms. The regulatory environment for healthcare is generally supportive, with the National Medical Products Administration (NMPA) streamlining drug approvals and encouraging innovation. However, pricing pressures from government procurement programs and the risk of policy changes (e.g., on drug pricing or insurance coverage) are important considerations. Despite these risks, healthcare offers attractive returns, with top-quartile funds achieving IRRs of 20-25% in this sector.\n\nGreen energy is a rapidly growing area for PE investment, driven by China's commitment to peak carbon emissions by 2030 and achieve carbon neutrality by 2060. The sector includes renewable energy (solar, wind, hydro), electric vehicles (EVs) and their supply chain (batteries, charging infrastructure), and energy storage. China is already the world's largest market for EVs and renewable energy, and government subsidies and regulations continue to support growth. PE investors are particularly active in the battery supply chain, including lithium, cobalt, and nickel mining, as well as battery manufacturing and recycling. The sector offers strong growth potential, but it is also capital-intensive and subject to commodity price volatility and technological disruption. GPs need to have deep industry expertise and a long-term investment horizon to succeed in this sector.\n\nThe shift in deal activity has implications for portfolio construction and risk management. Investors who are overweight in consumer and real estate may need to rebalance toward technology, healthcare, and green energy to capture growth and align with policy priorities. However, these sectors also come with higher valuations and specific risks, such as regulatory changes in technology and pricing pressures in healthcare. Diversification across sub-sectors and stages is important to manage risk. Additionally, the shift toward these sectors requires GPs to have specialized knowledge and networks, which may favor domestic firms with deep local expertise. For foreign investors, partnering with local firms or investing through RMB funds can provide access to these opportunities while mitigating some of the regulatory and geopolitical risks.`,
        },
        {
          heading: 'Exit Channels Are Constrained by Weak IPO Markets and Geopolitical Uncertainty',
          body: `The onshore IPO market, particularly the Shanghai STAR Market and the Shenzhen ChiNext Board, has been a key exit route for PE-backed companies. However, the number of IPOs on these boards has declined in 2024, as regulators have tightened listing criteria and slowed the approval process to improve market quality. The China Securities Regulatory Commission (CSRC) has also increased scrutiny of companies with high valuations or weak fundamentals, leading to a higher rate of withdrawn applications. As a result, many PE-backed companies are waiting longer to go public, and some are exploring alternative exit routes. The average time from investment to IPO has increased from 3-4 years to 5-6 years, extending fund lives and pressuring returns.\n\nOffshore IPOs, particularly in Hong Kong and the US, have been even more constrained. Hong Kong's IPO market has been weak due to a combination of factors, including a sluggish economy, geopolitical uncertainty, and competition from other listing venues. The number of Chinese companies listing in Hong Kong in 2024 is expected to be 30% lower than in 2021. US IPOs have been severely impacted by the Holding Foreign Companies Accountable Act (HFCAA) and the threat of delisting, which has led many Chinese companies to avoid US listings altogether. While the Public Company Accounting Oversight Board (PCAOB) reached an agreement with Chinese regulators in 2022 to allow inspections, the underlying tensions remain, and the US IPO market for Chinese companies is unlikely to recover to previous levels in the near term.\n\nTrade sales have become an increasingly important exit channel, accounting for 35% of exit value in 2024. Strategic buyers, including domestic and international corporations, are acquiring PE-backed companies to gain access to technology, market share, or supply chain capabilities. However, trade sales are often complex and time-consuming, requiring alignment on valuation, regulatory approvals, and integration plans. Secondary transactions, where PE firms sell their stakes to other investors, have also grown, accounting for 25% of exit value. Secondary buyers include dedicated secondary funds, other PE firms, and institutional investors seeking to rebalance their portfolios. While secondary transactions provide liquidity, they often occur at discounts to net asset value, particularly in a challenging market environment. The development of a more robust secondary market is a positive trend, but it is still in its early stages in China.\n\nLooking ahead, the exit environment is likely to remain challenging in 2025, with IPO markets recovering only gradually. The onshore IPO pipeline remains large, but the approval process will continue to be selective. Offshore IPOs may see some improvement if geopolitical tensions ease, but the structural barriers remain. Trade sales and secondary transactions will continue to grow in importance, but they require GPs to have strong relationships with strategic buyers and secondary investors. For LPs, the extended holding periods and uncertain exit timelines underscore the importance of patience and a long-term perspective. GPs will need to be proactive in managing their portfolios, exploring multiple exit options, and communicating transparently with LPs about exit strategies and timelines. Overall, the exit environment is a key risk factor for China PE, and investors should factor this into their return expectations and allocation decisions.`,
        },
      ],
    },
    comments: [],
  },
];
