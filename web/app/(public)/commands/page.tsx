import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faRobot, 
  faComments,
  faGamepad,
  faGift,
  faShieldAlt,
  faWrench,
  faTools,
  faArrowLeft,
  IconDefinition
} from "@fortawesome/free-solid-svg-icons"

const iconMap: Record<string, IconDefinition> = {
  faComments,
  faGamepad,
  faGift,
  faShieldAlt,
  faWrench,
  faTools
}

interface Command {
  name: string
  description: string
  usage: string
  aliases?: string[]
  permissions?: string
  isPremium?: boolean
  isSlashCommand?: boolean
}

interface Category {
  slug: string
  name: string
  description?: string
  icon: string
  color: string
  sortOrder: number
  commands: Command[]
}

async function getCommands() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/commands?lang=en`, {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      console.error('Failed to fetch commands')
      return { categories: [], lastSynced: null }
    }
    
    const data = await res.json()
    return data
  } catch (error) {
    console.error('Error fetching commands:', error)
    return { categories: [], lastSynced: null }
  }
}

export default async function CommandsPage() {
  const { categories, lastSynced } = await getCommands()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-75"></div>
            <div className="relative bg-slate-900 p-4 rounded-full">
              <FontAwesomeIcon icon={faRobot} className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Bot Commands</h1>
            <p className="text-slate-400">Complete list of all Lena's commands</p>
          </div>
        </div>

        {lastSynced && (
          <div className="mb-6 text-sm text-slate-500">
            Last synced: {new Date(lastSynced).toLocaleString()}
          </div>
        )}

        {categories.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">No commands available. Please try again later.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category: Category) => (
              <div 
                key={category.slug}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`${category.color}`}>
                    <FontAwesomeIcon 
                      icon={iconMap[category.icon] || faRobot} 
                      className="w-6 h-6" 
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                    {category.description && (
                      <p className="text-slate-400 text-sm mt-1">{category.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {category.commands.map((cmd: Command, idx: number) => (
                    <div 
                      key={idx}
                      className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-mono text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
                          {cmd.name}
                        </h3>
                        <div className="flex gap-2">
                          {cmd.isPremium && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                              Premium
                            </span>
                          )}
                          {cmd.isSlashCommand && (
                            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                              Slash
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-300 text-sm mb-3">{cmd.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide min-w-[60px]">
                            Usage:
                          </span>
                          <code className="text-xs text-slate-400 bg-slate-950/50 px-2 py-1 rounded flex-1">
                            {cmd.usage}
                          </code>
                        </div>

                        {cmd.aliases && cmd.aliases.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide min-w-[60px]">
                              Aliases:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {cmd.aliases.map((alias: string, i: number) => (
                                <code 
                                  key={i}
                                  className="text-xs text-slate-400 bg-slate-950/50 px-2 py-1 rounded"
                                >
                                  {alias}
                                </code>
                              ))}
                            </div>
                          </div>
                        )}

                        {cmd.permissions && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide min-w-[60px]">
                              Perms:
                            </span>
                            <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                              {cmd.permissions}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-3">Need Help?</h3>
          <p className="text-slate-300 mb-4">
            Use the <code className="text-blue-400 bg-slate-900 px-2 py-1 rounded">!help</code> command in Discord 
            to see commands with your server's custom prefix, or join our support server for assistance.
          </p>
          <Link 
            href="https://discord.gg/your-server"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Join Support Server
          </Link>
        </div>
      </div>
    </div>
  )
}
