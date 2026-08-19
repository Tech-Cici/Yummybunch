import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { api, ApiError, imageUrl, Restaurant } from '../../lib/api';
import { radius, spacing, useColors } from '../../lib/theme';
import {
  Badge, Body, Button, Card, EmptyState, ErrorNote, Heading, Loading, Row,
} from '../../components/ui';

export default function BrowseScreen() {
  const c = useColors();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.cuisines().then(setCuisines).catch(() => setCuisines([]));
  }, []);

  const load = useCallback(async (opts: { quiet?: boolean } = {}) => {
    if (!opts.quiet) setLoading(true);
    try {
      setRestaurants(await api.restaurants({ q: query || undefined, cuisine: cuisine || undefined }));
      setError(null);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [query, cuisine]);

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => load({ quiet: true }), 280);
    return () => clearTimeout(t);
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load({ quiet: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* search + filters */}
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search restaurants, cuisine or area…"
          placeholderTextColor={c.textMuted}
          returnKeyType="search"
          accessibilityLabel="Search restaurants"
          style={{
            backgroundColor: c.surface, borderColor: c.border, borderWidth: 1,
            borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 12,
            color: c.text, fontSize: 15,
          }}
        />

        {cuisines.length > 0 && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['All', ...cuisines]}
            keyExtractor={item => item}
            contentContainerStyle={{ gap: spacing.sm }}
            renderItem={({ item }) => {
              const isAll = item === 'All';
              const active = isAll ? cuisine === null : cuisine === item;
              return (
                <Pressable
                  onPress={() => setCuisine(isAll ? null : active ? null : item)}
                  style={{
                    paddingHorizontal: spacing.md, paddingVertical: 8,
                    borderRadius: radius.pill, borderWidth: 1,
                    borderColor: active ? c.primary : c.border,
                    backgroundColor: active ? c.primary : 'transparent',
                  }}
                >
                  <Body size={13} weight="600" style={{ color: active ? c.primaryText : c.text }}>
                    {item}
                  </Body>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      {error ? (
        <View style={{ paddingHorizontal: spacing.lg }}>
          <ErrorNote message={error} onRetry={() => load()} />
        </View>
      ) : loading ? (
        <Loading label="Finding restaurants…" />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={r => String(r.id)}
          contentContainerStyle={{ padding: spacing.lg, paddingTop: 0, gap: spacing.md }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              title={query || cuisine ? 'No matches' : 'No restaurants yet'}
              body={
                query || cuisine
                  ? 'Try a different search term.'
                  : 'Once a restaurant signs up, it appears here.'
              }
              action={
                query || cuisine
                  ? { label: 'Clear filters', onPress: () => { setQuery(''); setCuisine(null); } }
                  : undefined
              }
            />
          }
          renderItem={({ item }) => {
            const cover = imageUrl(item.coverImageUrl);
            return (
              <Card onPress={() => router.push(`/restaurant/${item.id}`)} style={{ padding: 0, overflow: 'hidden' }}>
                <View style={{ height: 132, backgroundColor: c.accent }}>
                  {cover ? (
                    <Image source={{ uri: cover }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Body size={34}>🍽</Body>
                    </View>
                  )}
                </View>

                <View style={{ padding: spacing.lg, gap: 6 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Heading style={{ flex: 1 }}>{item.name}</Heading>
                    {!item.acceptingOrders && <Badge label="Closed" />}
                  </Row>
                  {item.cuisine ? <Body tone="primary" size={13} weight="600">{item.cuisine}</Body> : null}
                  {item.address ? <Body tone="muted" numberOfLines={1}>{item.address}</Body> : null}
                  <Body tone="muted" size={12}>
                    {item.menuItemCount} item{item.menuItemCount === 1 ? '' : 's'}
                    {item.openingTime && item.closingTime ? ` · ${item.openingTime}–${item.closingTime}` : ''}
                  </Body>
                </View>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}
