/**
 * Small UI kit. React Native has no CSS, so these wrap the theme tokens and keep
 * the screens free of repeated StyleSheet noise.
 */
import { ReactNode } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, StyleProp, Text, TextInput,
  TextInputProps, TextStyle, View, ViewStyle, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, radius, spacing, useColors } from '../lib/theme';

// ---------------------------------------------------------------- layout

export function Screen({
  children, scroll = false, refreshing, onRefresh, contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const body = (
    <View style={[{ padding: spacing.lg, gap: spacing.lg }, contentStyle]}>{children}</View>
  );

  if (!scroll) {
    return (
      <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: c.background }}>
        {body}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh
            ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={c.primary} />
            : undefined
        }
      >
        {body}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({
  children, style, onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const c = useColors();
  const base: ViewStyle = {
    backgroundColor: c.surface,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  };

  if (!onPress) return <View style={[base, style]}>{children}</View>;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [base, pressed && { opacity: 0.7 }, style]}
    >
      {children}
    </Pressable>
  );
}

// ---------------------------------------------------------------- text

type TextTone = 'default' | 'muted' | 'primary' | 'danger' | 'success';

function toneColor(c: Colors, tone: TextTone) {
  return {
    default: c.text, muted: c.textMuted, primary: c.primary,
    danger: c.danger, success: c.success,
  }[tone];
}

export function Title({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useColors();
  return (
    <Text style={[{ color: c.text, fontSize: 26, fontWeight: '700' }, style]}>{children}</Text>
  );
}

export function Heading({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useColors();
  return (
    <Text style={[{ color: c.text, fontSize: 17, fontWeight: '600' }, style]}>{children}</Text>
  );
}

export function Body({
  children, tone = 'default', size = 14, weight = '400', style, numberOfLines,
}: {
  children: ReactNode;
  tone?: TextTone;
  size?: number;
  weight?: TextStyle['fontWeight'];
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const c = useColors();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ color: toneColor(c, tone), fontSize: size, fontWeight: weight }, style]}
    >
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------- controls

export function Button({
  label, onPress, variant = 'primary', disabled, loading, style, small,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const c = useColors();
  const off = disabled || loading;

  const bg = {
    primary: c.primary, outline: 'transparent', ghost: 'transparent', danger: c.danger,
  }[variant];
  const fg = {
    primary: c.primaryText, outline: c.text, ghost: c.primary, danger: '#FFFFFF',
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(off) }}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderColor: variant === 'outline' ? c.border : 'transparent',
          borderWidth: variant === 'outline' ? 1 : 0,
          borderRadius: radius.md,
          paddingVertical: small ? 9 : 14,
          paddingHorizontal: small ? spacing.md : spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
          opacity: off ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={fg} />}
      <Text style={{ color: fg, fontWeight: '600', fontSize: small ? 13 : 15 }}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label, hint, ...props
}: TextInputProps & { label: string; hint?: string }) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      <Body weight="500" size={13}>{label}</Body>
      <TextInput
        placeholderTextColor={c.textMuted}
        {...props}
        style={[
          {
            backgroundColor: c.background,
            borderColor: c.border,
            borderWidth: 1,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: 12,
            color: c.text,
            fontSize: 15,
          },
          props.style,
        ]}
      />
      {hint ? <Body tone="muted" size={12}>{hint}</Body> : null}
    </View>
  );
}

export function Badge({
  label, tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'primary';
}) {
  const c = useColors();
  const map = {
    neutral: [c.surfaceAlt, c.textMuted],
    success: [c.successBg, c.success],
    danger: [c.dangerBg, c.danger],
    warning: [c.warningBg, c.warning],
    primary: [c.accent, c.accentText],
  } as const;
  const [bg, fg] = map[tone];

  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill }}>
      <Text style={{ color: fg, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------- states

export function Loading({ label }: { label?: string }) {
  const c = useColors();
  return (
    <View style={{ paddingVertical: 64, alignItems: 'center', gap: spacing.md }}>
      <ActivityIndicator color={c.primary} />
      {label ? <Body tone="muted">{label}</Body> : null}
    </View>
  );
}

export function EmptyState({
  title, body, action,
}: {
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void };
}) {
  const c = useColors();
  return (
    <View
      style={{
        borderWidth: 1, borderStyle: 'dashed', borderColor: c.border,
        borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', gap: spacing.md,
      }}
    >
      <Heading style={{ textAlign: 'center' }}>{title}</Heading>
      {body ? <Body tone="muted" style={{ textAlign: 'center' }}>{body}</Body> : null}
      {action ? <Button label={action.label} onPress={action.onPress} /> : null}
    </View>
  );
}

/** Errors are shown, never swallowed — a phone with no signal must say so. */
export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const c = useColors();
  return (
    <View
      style={{
        backgroundColor: c.dangerBg, borderRadius: radius.md,
        padding: spacing.lg, gap: spacing.md,
      }}
    >
      <Body tone="danger">{message}</Body>
      {onRetry ? <Button label="Try again" variant="outline" small onPress={onRetry} /> : null}
    </View>
  );
}

export function Row({
  children, style, gap = spacing.md,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
}) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>
  );
}
