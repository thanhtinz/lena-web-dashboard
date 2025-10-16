import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faRobot, 
  faStar, 
  faArrowRight,
  faShieldAlt,
  faGift,
  faComments,
  faChartLine,
  faGamepad,
  faMagic
} from "@fortawesome/free-solid-svg-icons"
import Navigation from "@/components/landing/Navigation"
import { db } from '@/lib/db'
import { pricingPlans } from '@/lib/schema'
import { sql } from 'drizzle-orm'

// Revalidate page every 60 seconds (cache for 1 minute)
export const revalidate = 60

export default async function LandingPage() {
  // Fetch real stats from database
  const statsResult = await db.execute(sql`
    SELECT 
      (SELECT COUNT(DISTINCT server_id) FROM conversation_logs) as total_servers,
      (SELECT COUNT(*) FROM conversation_logs) as total_conversations,
      (SELECT COUNT(DISTINCT user_id) FROM conversation_logs) as active_users
  `);
  
  const stats = statsResult.rows[0];
  const totalServers = Number(stats.total_servers) || 0;
  const totalConversations = Number(stats.total_conversations) || 0;
  const activeUsers = Number(stats.active_users) || 0;

  // Fetch pricing plans from database
  const plans = await db
    .select()
    .from(pricingPlans)
    .where(sql`${pricingPlans.isVisible} = true AND ${pricingPlans.isActive} = true`)
    .orderBy(pricingPlans.priceUsd);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />

      <section className="pt-28 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full mb-6 text-sm">
            <FontAwesomeIcon icon={faStar} className="h-3.5 w-3.5" />
            <span>Trusted by {totalServers.toLocaleString()}+ Discord Servers</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            AI-Powered Discord Bot
            <br />
            <span className="text-blue-400">That Does It All</span>
          </h1>
          
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Meet Lena - your cute, smart Discord companion with 6 personalities, 70+ games, advanced moderation, and powerful AI features.
          </p>
          
          <div className="flex gap-3 justify-center">
            <Link 
              href={`https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=1099780063239&scope=bot%20applications.commands`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-5 py-2.5 rounded font-medium hover:bg-blue-700 inline-flex items-center gap-2 text-sm"
            >
              Add to Discord
              <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="border border-blue-600 text-blue-400 px-5 py-2.5 rounded font-medium hover:bg-blue-600/10 text-sm">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-blue-900/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400">{totalServers.toLocaleString()}+</div>
              <div className="text-slate-400 mt-1 text-sm">Active Servers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">{activeUsers.toLocaleString()}+</div>
              <div className="text-slate-400 mt-1 text-sm">Happy Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">{totalConversations.toLocaleString()}+</div>
              <div className="text-slate-400 mt-1 text-sm">Conversations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">99.9%</div>
              <div className="text-slate-400 mt-1 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-6 rounded-lg">
              <FontAwesomeIcon icon={faMagic} className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">6 AI Personalities</h3>
              <p className="text-slate-400">Switch between Lena, Tutor, Tech Support, Developer, and more specialized modes.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <FontAwesomeIcon icon={faGamepad} className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">70+ Games</h3>
              <p className="text-slate-400">Interactive games, trivia, truth or dare, and Vietnamese knowledge challenges.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <FontAwesomeIcon icon={faShieldAlt} className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Advanced Moderation</h3>
              <p className="text-slate-400">Complete moderation suite with ban, kick, mute, warn, purge, and content filtering.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <FontAwesomeIcon icon={faGift} className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Giveaway System</h3>
              <p className="text-slate-400">Full giveaway management with auto-end, winner selection, and blacklist support.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <FontAwesomeIcon icon={faComments} className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Auto Responses</h3>
              <p className="text-slate-400">Custom keyword triggers, auto-reactions, welcome/leave messages, and embed builder.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <FontAwesomeIcon icon={faChartLine} className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Real-time Info</h3>
              <p className="text-slate-400">Web search, Vietnam news, game info for 23+ titles, and YouTube/TikTok search.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 bg-slate-950">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">Choose Your Plan</h2>
          <p className="text-center text-slate-400 mb-12">Select the perfect plan for your Discord server</p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.length > 0 ? plans.map((plan) => {
              const isPopular = plan.badge === 'popular';
              
              return (
                <div 
                  key={plan.id} 
                  className={`bg-slate-800 p-8 rounded-lg relative ${
                    isPopular ? 'border-2 border-blue-500' : 'border border-slate-700'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">${plan.priceUsd}</span>
                    <span className="text-slate-400">/{plan.billingCycle}</span>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                  )}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="text-slate-300 flex items-start gap-2">
                        <span className="text-blue-500">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="#" 
                    className={`block w-full text-center px-4 py-2 rounded ${
                      isPopular 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'border border-blue-600 text-blue-400 hover:bg-blue-600/10'
                    }`}
                  >
                    {plan.priceUsd === 0 ? 'Get Started' : 'Upgrade Now'}
                  </Link>
                </div>
              );
            }) : (
              // Fallback if no plans in database
              <>
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                  <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">$0</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="text-slate-300 flex items-start gap-2">
                      <span className="text-blue-500">✓</span> Basic AI features
                    </li>
                    <li className="text-slate-300 flex items-start gap-2">
                      <span className="text-blue-500">✓</span> 5 giveaways/month
                    </li>
                    <li className="text-slate-300 flex items-start gap-2">
                      <span className="text-blue-500">✓</span> Standard support
                    </li>
                  </ul>
                  <Link href="#" className="block w-full text-center border border-blue-600 text-blue-400 px-4 py-2 rounded hover:bg-blue-600/10">
                    Get Started
                  </Link>
                </div>
                <div className="bg-slate-800 p-8 rounded-lg border-2 border-blue-500 relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">$5</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="text-slate-300 flex items-start gap-2">
                      <span className="text-blue-500">✓</span> Unlimited giveaways
                    </li>
                    <li className="text-slate-300 flex items-start gap-2">
                      <span className="text-blue-500">✓</span> Priority support
                    </li>
                  </ul>
                  <Link href="#" className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Upgrade Now
                  </Link>
                </div>
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                  <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">$15</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="text-slate-300 flex items-start gap-2">
                      <span className="text-blue-500">✓</span> Unlimited servers
                    </li>
                    <li className="text-slate-300 flex items-start gap-2">
                      <span className="text-blue-500">✓</span> Dedicated support
                    </li>
                  </ul>
                  <Link href="#" className="block w-full text-center border border-blue-600 text-blue-400 px-4 py-2 rounded hover:bg-blue-600/10">
                    Contact Sales
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 border-t border-slate-800 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faRobot} className="h-6 w-6 text-blue-500" />
                <span className="font-bold text-white">Lena Bot</span>
              </div>
              <p className="text-slate-400 text-sm">Your intelligent Discord companion</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="/#features" className="block text-slate-400 hover:text-blue-400">Features</Link>
                <Link href="/commands" className="block text-slate-400 hover:text-blue-400">Commands</Link>
                <Link href="/#pricing" className="block text-slate-400 hover:text-blue-400">Pricing</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Resources</h4>
              <div className="space-y-2 text-sm">
                <Link href="/blog" className="block text-slate-400 hover:text-blue-400">Blog</Link>
                <Link href="/docs" className="block text-slate-400 hover:text-blue-400">Documentation</Link>
                <Link href="/support" className="block text-slate-400 hover:text-blue-400">Support</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2025 Lena Bot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
