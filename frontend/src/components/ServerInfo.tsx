type ServerInfoProps = {
  title: string
  message: string
  timeIso: string
}

export default function ServerInfo({ title, message, timeIso }: ServerInfoProps) {
  return (
    <div className="server-info">
      <h1>{title}</h1>
      <p>
        Backend dit: {message || '...'}
      </p>
      <p>
        Heure serveur (ISO): {timeIso || '...'}
      </p>
    </div>
  )
}


