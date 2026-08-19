import { View } from 'react-native';
import { Order, PROGRESSION, STATUS_LABEL } from '../lib/api';
import { spacing, useColors } from '../lib/theme';
import { Body, Row } from './ui';

/**
 * Vertical timeline of the order's real recorded events, plus the steps still to
 * come. Vertical rather than horizontal because it has to read on a narrow phone.
 */
export function OrderProgress({ order }: { order: Order }) {
  const c = useColors();

  if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
    const declined = order.status === 'REJECTED';
    return (
      <View
        style={{
          backgroundColor: declined ? c.dangerBg : c.surfaceAlt,
          borderRadius: 12, padding: spacing.lg, gap: 4,
        }}
      >
        <Body weight="700" tone={declined ? 'danger' : 'default'}>
          {declined ? 'Declined by the restaurant' : 'You cancelled this order'}
        </Body>
        {order.rejectionReason ? (
          <Body tone="danger" size={13}>Reason: {order.rejectionReason}</Body>
        ) : null}
      </View>
    );
  }

  const currentIndex = PROGRESSION.indexOf(order.status);
  const timeFor = (status: string) => {
    const hit = order.timeline.find(t => t.status === status);
    if (!hit) return null;
    return new Date(hit.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View>
      {PROGRESSION.map((step, i) => {
        const done = i <= currentIndex;
        const current = i === currentIndex;
        const at = timeFor(step);
        const last = i === PROGRESSION.length - 1;

        return (
          <Row key={step} style={{ alignItems: 'flex-start' }} gap={spacing.md}>
            {/* dot + connector */}
            <View style={{ alignItems: 'center', width: 22 }}>
              <View
                style={{
                  width: 18, height: 18, borderRadius: 9,
                  backgroundColor: done ? c.primary : c.surfaceAlt,
                  borderWidth: done ? 0 : 1, borderColor: c.border,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {done ? (
                  <Body size={10} weight="700" style={{ color: c.primaryText }}>✓</Body>
                ) : null}
              </View>
              {!last && (
                <View
                  style={{
                    width: 2, height: 30,
                    backgroundColor: i < currentIndex ? c.primary : c.border,
                  }}
                />
              )}
            </View>

            <View style={{ flex: 1, paddingBottom: last ? 0 : spacing.md }}>
              <Body
                weight={current ? '700' : '500'}
                tone={current ? 'primary' : done ? 'default' : 'muted'}
              >
                {STATUS_LABEL[step]}
              </Body>
              {at ? <Body tone="muted" size={12}>{at}</Body> : null}
            </View>
          </Row>
        );
      })}
    </View>
  );
}
