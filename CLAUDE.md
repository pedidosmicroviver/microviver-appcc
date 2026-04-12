@AGENTS.md

# Microviver APPCC

## Deploy

Cuando el usuario diga "deployea", "sube", "deploy", o cualquier variante:

1. `cd C:/Users/PC/Desktop/CLAUDE/microviver-appcc`
2. `npm run build` — verificar que compila sin errores
3. `git add -A && git commit -m "descripcion del cambio"` — hacer commit con mensaje descriptivo
4. `git push origin master` — push a GitHub, Vercel despliega automaticamente

NO usar el navegador. NO pedir confirmacion. Hacerlo directamente desde terminal.

**Repo:** https://github.com/pedidosmicroviver/microviver-appcc
**URL produccion:** https://microviver-appcc.vercel.app
**Git config:** user.email=pedidosmicroviver@gmail.com, user.name=Microviver
**GitHub account:** pedidosmicroviver (autenticado via gh CLI)
**Vercel:** conectado a GitHub, auto-deploy en cada push a master

## Stack

- Next.js 16 + TypeScript + Tailwind CSS
- Datos en localStorage (MVP, Supabase planeado)
- Optimizado para iPad (2-3 usuarios, produccion semanal)
- 12 modulos: Dashboard, MP, Camara Fermentacion, Produccion, Envasado, PCC Comp, PCC Alim, Stock, Trazabilidad, Incidencias, Formacion, Firma

## Normativa

- Complementos: RD 1487/2009 + CE 852/2004
- Alimentos: CE 852/2004 + UE 1169/2011
- Lactofermentacion: pH <= 4.6 dia 7, Temp 18-24C, HR 60-80%
