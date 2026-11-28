import { expect, it } from 'vitest';
import { loadCase } from '../../features/case-runtime';
import { tagSuspect, removePinnedCard } from '../../features/investigation';
import { deriveNodesFromTaggedEvidence } from '../../features/wife-notebook/WifeNotebookModal';
import { calculateConfrontationPreflight, getSuspectsOnBoard } from '../../features/wife-notebook/confrontationEngine';
import { normalizeEcommerceData } from './ecommerceData';
import { ecommerceEvidence, orderSnippet } from './ecommerceEvidence';

it('keeps delivery names, phone numbers and addresses consistent across all level-one orders', () => {
  const caseConfig = loadCase('case_01');
  const orders = normalizeEcommerceData(caseConfig.appsData.ecommerce)!.orders;
  const home = 'Căn hộ 1206, tòa CT2, chung cư An Bình, 18 ngõ 68 Trung Kính, Hà Nội';
  const office = 'Sảnh Technosoft, tầng 1, tòa Minh An, 28 Duy Tân, Hà Nội';
  const dorm = 'Phòng 305, nhà B2, KTX An Hòa, 16 ngõ 165 Xuân Thủy, Hà Nội';
  const countryside = 'Xóm 3, xã Yên Phong, huyện Ý Yên, Nam Định';
  const contacts = (caseConfig.appsData.phone as { contacts: { displayName: string; primaryPhone: string }[] }).contacts;
  const phoneFor = (name: string) => contacts.find(contact => contact.displayName === name)!.primaryPhone;
  for (const order of orders) {
    expect(order.recipientPhone).toMatch(/^0\d{9}$/);
    if (order.suspectName) expect(order.suspectName).toBe(order.recipientName);
    if (order.orderId === 'order_heater') {
      expect(order.suspectId).toBeUndefined();
      expect(order.recipientName).toBe('Nguyễn Thị Hòa');
      expect(order.recipientPhone).toBe(phoneFor('Mẹ Ở Quê'));
      expect(order.shippingAddress).toBe(countryside);
    } else if (order.suspectId === caseConfig.husbandId) {
      expect(order.recipientName).toBe('Nguyễn Huy Thịnh');
      expect(order.recipientPhone).toBe('0901236789');
      expect(order.shippingAddress).toBe(home);
    } else if (order.suspectId === 'suspect_huong') {
      expect(order.recipientName).toBe('Nguyễn Thị Thu Hương');
      expect(order.recipientPhone).toBe(phoneFor('Khoa BE'));
      expect(order.shippingAddress).toBe(office);
    } else if (order.suspectId === 'suspect_mai') {
      expect(order.recipientName).toBe('Đỗ Thị Mai');
      expect(order.recipientPhone).toBe(phoneFor('Mai Lễ Tân'));
      expect(order.shippingAddress).toBe(office);
    } else {
      expect(order.suspectId).toBe('suspect_ngoc');
      expect(order.recipientPhone).toBe(phoneFor('Bé Ngọc KTX'));
      expect(order.shippingAddress).toBe(dorm);
    }
  }
  expect(new Set(orders.map(order => order.recipientPhone)).size).toBe(5);
  expect(contacts.some(contact => contact.primaryPhone === '0901236789')).toBe(false);
  // The culprit phone is shared only with the saved "Khoa BE" contact and the dress order.
  expect(orders.filter(order => order.recipientPhone === phoneFor('Khoa BE')).map(order => order.orderId)).toEqual(['order_01']);
});

it('preserves every order recipient identity through pinning and keeps the culprit masked until the bridge edge', () => {
  const caseConfig = loadCase('case_01');
  const orders = normalizeEcommerceData(caseConfig.appsData.ecommerce)!.orders;
  const graph = { nodes: [], edges: [], requiredSmokingGunEdgeIds: [] };
  let tags: ReturnType<typeof tagSuspect>['suspects'] = [];
  const tagged = orders.filter(order => order.suspectName);
  expect(tagged.map(order => order.orderId)).not.toContain('order_heater');
  for (const [index, order] of tagged.entries()) {
    const expectedId = order.suspectId!;
    expect(order.suspectName).toBe(order.recipientName);
    const item = ecommerceEvidence(caseConfig.caseId, order.orderId, order.recipientName!,
      orderSnippet(order), order, order.orderDate, 'order');
    tags = tagSuspect(tags, item.suspectToTag, 'ecommerce', index + 1, item.source).suspects;
    const nodes = deriveNodesFromTaggedEvidence(graph, tags).map(node => ({ ...node, x: 0, y: 0 }));
    const current = nodes.find(node => node.recordRefId === order.orderId)!;
    expect(current.subjectSuspectId).toBe(expectedId);
    const suspects = getSuspectsOnBoard({ placedNodes: [current], taggedSuspects: tags, caseConfig });
    expect(suspects.find(suspect => suspect.id === expectedId)).toMatchObject({ displayName: order.recipientName });
    const preflight = calculateConfrontationPreflight({ caseConfig, placedNodes: [current],
      activeEdges: [], accusedSuspectId: expectedId });
    expect(preflight.accusedSuspectAlias).toBe(order.recipientName);
    expect(suspects.find(suspect => suspect.id === expectedId)).toMatchObject({ alias: order.recipientName, isUnmasked: false });
  }
  const nodes = deriveNodesFromTaggedEvidence(graph, tags).map(node => ({ ...node, x: 0, y: 0 }));
  expect(nodes).toHaveLength(tagged.length);
  expect(getSuspectsOnBoard({ placedNodes: nodes, taggedSuspects: tags, caseConfig }).map(s => s.id).sort())
    .toEqual(['husband_hoang', 'suspect_huong', 'suspect_mai', 'suspect_ngoc']);
  const removed = removePinnedCard(tags, nodes[0].suspectId!);
  expect(removed.suspects).toHaveLength(tagged.length - 1);
  expect(removed.suspects.some(tag => tag.evidence?.recordId === tagged[1].orderId)).toBe(true);
});
