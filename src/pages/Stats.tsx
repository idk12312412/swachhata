import { useStats } from "@/hooks/useClassifications";
import { useProfile, getRankInfo } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recycle, Leaf, TreePine, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { motion } from "framer-motion";

const COLORS = ["hsl(152,45%,35%)", "hsl(38,60%,55%)", "hsl(200,50%,55%)", "hsl(120,40%,45%)", "hsl(0,65%,50%)", "hsl(270,40%,55%)"];

const Stats = () => {
  const { data: stats, isLoading } = useStats();
  const { profile } = useProfile();
  const rankInfo = getRankInfo(profile?.points ?? 0);

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading stats...</div>;

  const pieData = stats
    ? Object.entries(stats.materialBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const barData = stats
    ? Object.entries(stats.weeklyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, count]) => ({ date: date.slice(5), count }))
    : [];

  // Cumulative CO2 line
  const lineData = stats?.items
    ? [...stats.items]
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .reduce<{ date: string; co2: number }[]>((acc, item) => {
          const prev = acc.length > 0 ? acc[acc.length - 1].co2 : 0;
          acc.push({ date: item.created_at.slice(5, 10), co2: prev + Number(item.co2_saved) });
          return acc;
        }, [])
    : [];

  const treesEquivalent = ((stats?.totalCo2 ?? 0) / 21.77).toFixed(1);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" /> Your Impact
        </h1>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Recycle className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold font-display">{stats?.totalItems ?? 0}</p>
            <p className="text-xs text-muted-foreground">Items Classified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Leaf className="w-6 h-6 mx-auto text-eco-leaf mb-2" />
            <p className="text-3xl font-bold font-display">{(stats?.totalCo2 ?? 0).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg CO₂ Saved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TreePine className="w-6 h-6 mx-auto text-eco-earth mb-2" />
            <p className="text-3xl font-bold font-display">{treesEquivalent}</p>
            <p className="text-xs text-muted-foreground">Trees Equivalent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <span className="text-2xl">{rankInfo.emoji}</span>
            <p className="text-lg font-bold font-display mt-1">{rankInfo.rank}</p>
            <p className="text-xs text-muted-foreground">{profile?.points ?? 0} pts</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {pieData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Material Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {barData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Items by Day</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(152,45%,35%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {lineData.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cumulative CO₂ Saved</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="co2" stroke="hsl(120,40%,45%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {(stats?.totalItems ?? 0) === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Start classifying items to see your impact stats!
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Stats;
