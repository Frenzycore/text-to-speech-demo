import { Mail, Github, Heart, Server, FileText } from "lucide-react"

const supportLinks = [
  {
    href: "mailto:frenzy.lux@gmail.com",
    label: "Email",
    icon: Mail,
  },
  {
    href: "https://github.com/Frenzycore",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "https://saweria.co/Ornzora",
    label: "Support Dev",
    icon: Heart,
  },
  {
    href: "https://cdn.ornzora.eu.cc",
    label: "CDN",
    icon: Server,
  },
  {
    href: "https://cdn.ornzora.eu.cc/docs",
    label: "CDN Docs",
    icon: FileText,
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Support Links */}
          <nav 
            className="flex flex-wrap items-center justify-center gap-4"
            aria-label="Support and resources"
          >
            {supportLinks.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary"
                  aria-label={`${link.label} (opens in new tab)`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{link.label}</span>
                </a>
              )
            })}
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center">
            Built with Ornzora TTS API
          </p>
        </div>
      </div>
    </footer>
  )
}
