#!/usr/bin/env bash
# setup-dashboard-structure.sh
# Crea la estructura de carpetas para la refactorización del dashboard.
# Ejecutar desde la raíz del proyecto: bash scripts/setup-dashboard-structure.sh

set -e

echo "📁 Creando estructura de carpetas para el dashboard..."

# Types
mkdir -p types

# Sidebar y utilidades del dashboard
mkdir -p components/dashboard

# Vistas individuales (Fase 2)
mkdir -p components/dashboard/views

# Hooks compartidos del dashboard (futuro)
mkdir -p hooks/dashboard

echo ""
echo "✅ Estructura creada:"
echo ""
echo "  types/"
echo "  └── dashboard.ts              ← tipos compartidos (YA CREADO)"
echo ""
echo "  components/"
echo "  └── dashboard/"
echo "      ├── Sidebar.tsx            ← sidebar extraído (YA CREADO)"
echo "      └── views/                 ← vistas individuales (Fase 2)"
echo "          ├── ViewHoy.tsx"
echo "          ├── ViewSelloRapido.tsx"
echo "          ├── ViewTarjeta.tsx"
echo "          ├── ViewClientes.tsx"
echo "          ├── ViewCupones.tsx"
echo "          ├── ViewPush.tsx"
echo "          ├── ViewProximidad.tsx"
echo "          ├── ViewCumple.tsx"
echo "          ├── ViewReactivacion.tsx"
echo "          ├── ViewInsights.tsx"
echo "          ├── ViewReseñas.tsx"
echo "          ├── ViewReferencias.tsx"
echo "          ├── ViewRuleta.tsx"
echo "          ├── ViewMetricasSucursal.tsx"
echo "          ├── ViewDominioPersonalizado.tsx"
echo "          ├── ViewImprimir.tsx"
echo "          ├── ViewPerfil.tsx"
echo "          ├── ViewPlan.tsx"
echo "          └── ViewAyuda.tsx"
echo ""
echo "  hooks/dashboard/               ← hooks compartidos (Fase 3)"
echo ""
echo "Siguiente paso: agregar los archivos de Fase 2 (respondé 'Continuar Fase 2')."
