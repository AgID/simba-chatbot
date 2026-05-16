# deploy/ — Template configurazione VM AgID FastWeb (SIMBA)

Configurazioni infrastrutturali per SIMBA chatbot sulla VM AgID condivisa
con Cruscotto Italia.

## Contenuto

```
deploy/
├── nginx/
│   └── chatbot.dati.gov.it.conf.template   # vhost SIMBA con /simba-stats/
└── cron/
    └── simba-monitoring                     # alert + stats SIMBA dedicati
```

## Pre-flight VM AgID

```bash
# Directory base SIMBA stats
sudo mkdir -p /var/www/simba-stats /var/lib/cruscotto-alert/simba
sudo chown www-data:www-data /var/www/simba-stats
sudo chown root:root /var/lib/cruscotto-alert/simba

# istat-names.json viene da Cruscotto Italia (riusato per compat)
sudo ln -sf /var/www/cruscotto-stats/istat-names.json \
  /var/www/simba-stats/istat-names.json
```

## Deploy nginx vhost SIMBA

```bash
sudo cp deploy/nginx/chatbot.dati.gov.it.conf.template /etc/nginx/conf.d/chatbot.dati.gov.it.conf
# Edit:
#   - Verifica server_name == chatbot.dati.gov.it
#   - Verifica path cert SSL (gestiti separatamente)
sudo nginx -t
sudo systemctl reload nginx

# Smoke test
curl -k https://localhost/simba-stats/    # atteso 401 (auth basic)
```

## Deploy cron SIMBA

```bash
sudo cp deploy/cron/simba-monitoring /etc/cron.d/
sudo chmod 644 /etc/cron.d/simba-monitoring
sudo systemctl reload cron

# Verifica cron pianificato
sudo grep -i simba /etc/cron.d/* | head
```

## Dipendenze esterne

SIMBA cron riutilizza gli script analytics di `AgID/cruscotto-italia`:

- `/home/ubuntu/cruscotto-italia/scripts/analytics/alert_attacks.py`
- `/home/ubuntu/cruscotto-italia/scripts/analytics/stats_aggregator.py`

Quindi il repo Cruscotto deve essere clonato sulla VM AgID prima dei cron SIMBA.
Vedi anche `AgID/cruscotto-italia/deploy/README.md`.

## Cert SSL

Cert per `chatbot.dati.gov.it` gestito separatamente (ticket provider AgID
oppure certbot Let's Encrypt). Una volta installato:

- AgID provider: cert in `/etc/ssl/dati.gov.it/`
- Let's Encrypt: `sudo certbot --nginx -d chatbot.dati.gov.it`

## Note operative

- **Log dedicati**: `chatbot.access.log` separato da `cruscotto-italia.access.log`
  per evitare log promiscui e analytics inquinati.
- **State alert separato**: `/var/lib/cruscotto-alert/simba/` (no contesa con
  Cruscotto alert state).
- **Stats htpasswd**: stesso file `/etc/nginx/.htpasswd-stats` di Cruscotto
  (un solo set credenziali per entrambe le dashboard).
- **Cron sfasati**: alert SIMBA all'ora `:00`, stats SIMBA alle `:15`, per
  evitare contesa con cron Cruscotto.
