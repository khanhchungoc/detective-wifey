/**
 * Declarative Knowledge Graph Schema (System Scope 1C / US-015)
 * Defines typed nodes and edges for the Wife's Detective Corkboard Node Canvas.
 */

export type GraphNodeType =
  | 'suspect'          // Canonical suspect profile (e.g., Hương Marketing)
  | 'alias'            // Disguised contact or handle (e.g., Anh Tuấn Thợ Điện)
  | 'bridge_id'        // Shared identifier (e.g., phone number, bank legal name)
  | 'record_clue'      // App record with evidence (e.g., Shopee dress order, Cơm Niêu receipt)
  | 'timeline_slot';   // Time marker (e.g., 20:46 vs 20:48)

export type GraphEdgeType =
  | 'uses_alias'          // Mystery contact uses disguised name
  | 'bridges_identity'    // Identifier links alias to legal suspect profile
  | 'occurred_at'         // Record belongs to a specific timestamp
  | 'contradicts_alibi';  // Two records contradict claimed whereabouts

import type { PinnedMessageEntry } from './evidence';

export interface CaseGraphNode {
  nodeId: string;
  type: GraphNodeType;
  label: string;
  subtitle?: string;
  sourceAppId?: string;
  recordRefId?: string;
  clueRefId?: string;
  isInitialDisguise?: boolean;
  metadata?: Record<string, string>;
  conversationId?: string;
  visibleAlias?: string;
  isExplicitConversationPin?: boolean;
  messages?: PinnedMessageEntry[];
  suspectId?: string;
  subjectSuspectId?: string; // Person attributed to this record; suspectId remains the unique pin key.
  unmasksToSuspectId?: string; // Target real suspect profile this alias resolves to (e.g. node_suspect_huong)
  eventTime?: string;
  eventDate?: string;
  rawTimestamp?: string | number;
  direction?: 'incoming' | 'outgoing' | 'inflow' | 'outflow';
  sender?: string;
  imageSrc?: string;
  imagePosition?: string;
}

export interface CaseGraphEdge {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationship: GraphEdgeType;
  isCanonical?: boolean;
  isSmokingGun: boolean;
  explanationRoastHint?: string;
}

export interface CaseKnowledgeGraph {
  nodes: CaseGraphNode[];
  edges: CaseGraphEdge[];
  requiredSmokingGunEdgeIds: string[];
}

