# Simulador de Compra de Vivienda, Hipoteca y Reforma (PWA)

Una Progressive Web App (PWA) moderna, responsive y 100% offline-first desarrollada con **Angular 22** (Standalone Components, Angular Signals y Reactive Forms) y **Tailwind CSS**. Diseñada para simular compras de inmuebles residenciales en España, préstamos hipotecarios mediante el sistema de amortización francés, desglose de impuestos y aranceles (Comunidad de Madrid) y reformas, con diagnósticos inmediatos de riesgo y comparativa de escenarios.

Desplegable de forma directa y automatizada en **GitHub Pages**.

---

## 🚀 Características Principales

1. **Simulación Financiera Integral**:
   - **Inmueble y Financiación**: Precio de compraventa, % de financiación (LTV), plazo en años (y meses), tipo de interés nominal anual (TIN).
   - **Gastos e Impuestos**: ITP de la Comunidad de Madrid (tipo general 6% o reducido 4%), aranceles notariales, registro de la propiedad, gestoría administrativa y tasación oficial homologada.
   - **Presupuesto de Reforma**: Estimación editable de costes de obra y acondicionamiento.
   - **Capacidad y Ahorro**: Fondos líquidos disponibles, ingresos netos anuales y mensuales de la unidad familiar.

2. **Cálculos y Fórmulas Matemáticas**:
   - **Cuota Mensual (Sistema Francés)**:
     $$M = \frac{P \cdot r \cdot (1+r)^n}{(1+r)^n - 1}$$
     donde $P$ es el capital financiado, $r = \frac{\text{TIN}}{12 \cdot 100}$ y $n = \text{plazo en meses}$.
   - **Total Intereses y Coste del Préstamo**: Intereses totales y total devuelto al banco a lo largo de la vida del préstamo.
   - **Aportación Inicial Necesaria**: Entrada no financiada + Total de gastos e impuestos + Presupuesto de reforma.
   - **Coste Total de la Operación**: Precio de compraventa + Gastos de escrituración + Reforma.
   - **Balance de Liquidez**: Superávit o déficit entre el dinero ahorrado disponible y el total de la aportación inicial requerida.

3. **Ratios de Riesgo y Diagnóstico Bancario**:
   - **Ratio de Endeudamiento Neto**: Porcentaje de la cuota respecto al ingreso familiar mensual.
   - **Tope Recomendado (35%)**: Umbral prudencial estándar del Banco de España y entidades crediticias.
   - **Diagnóstico de Viabilidad de Cuota**: **APROBADO** ($\le 35\%$) o **EN RIESGO / DESACONSEJADO** ($> 35\%$).
   - **Diagnóstico de Liquidez**: **FONDOS SUFICIENTES** (con colchón remanente) o **FONDOS INSUFICIENTES** (indicando la financiación extra o brecha requerida).
   - **Margen Familiar Libre**: Saldo neto mensual remanente en la unidad familiar tras abonar la hipoteca.

4. **Gestión y Comparación de Múltiples Escenarios**:
   - Creación, duplicación, renombrado y eliminación de diferentes pisos o alternativas (ej. *Piso A: 750k con reforma*, *Piso B: 680k sin reforma*).
   - **Vista Comparativa Lateral**: Matriz comparativa con métricas de viabilidad lado a lado.
   - **Persistencia Local (LocalStorage)**: Todos los escenarios se conservan en el navegador del usuario automáticamente.
   - **Exportación / Importación JSON**: Posibilidad de descargar y restaurar copias de seguridad de los escenarios.

5. **PWA y 100% Offline-First**:
   - Service Worker (`@angular/service-worker`) y Web App Manifest (`manifest.webmanifest`).
   - Indicador de conectividad en tiempo real (Online / Offline).
   - Botón nativo para instalar la aplicación como app de escritorio o móvil.
   - Notificación y recarga automática ante nuevas versiones disponibles.

6. **Convención de Idiomas Estricta**:
   - **Código fuente, interfaces, servicios, signals y tests**: Redactados en **inglés**.
   - **Interfaz de usuario (UI), etiquetas, badges y diagnósticos**: En **español (es-ES)**.

---

## 📂 Estructura del Proyecto

```text
spanish-mortgage-planner/
├── .github/
│   └── workflows/
│       └── deploy.yml                       # Flujo CI/CD GitHub Actions a GitHub Pages
├── public/
│   ├── manifest.webmanifest                 # Manifiesto de la PWA
│   ├── icons/                               # Iconos en múltiples resoluciones
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/                      # Interfaces TypeScript (MortgageInputs, MortgageResults, Scenario, etc.)
│   │   │   └── services/                    # Lógica de cálculo (MortgageCalculatorService), persistencia (ScenarioService), PWA (PwaUpdateService)
│   │   ├── features/
│   │   │   ├── dashboard/                   # Componente principal del panel financiero
│   │   │   ├── forms/                       # Formularios reactivos (Inmueble, Gastos, Capacidad)
│   │   │   ├── results/                     # KPIs principales, medidor de ratios, desglose visual y cuadro de amortización
│   │   │   └── scenarios/                   # Selector de escenarios y matriz de comparación
│   │   ├── shared/                          # Header, Slider/Input sincronizado, Badges y Pipes de moneda es-ES
│   │   ├── app.ts                           # Raíz de la aplicación
│   │   └── app.config.ts                    # Configuración standalone y Service Worker
│   ├── index.html
│   ├── main.ts
│   └── styles.css                           # Tailwind CSS v4 y utilidades de diseño
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 🛠️ Comandos de Desarrollo y Construcción

### Iniciar servidor de desarrollo
```bash
pnpm start
# o
pnpm exec ng serve
```
La aplicación estará accesible en `http://localhost:4200/`.

### Ejecutar tests unitarios (Vitest)
```bash
pnpm test --watch=false
```
Ejecuta la suite de pruebas unitarias sobre el motor de cálculo matemático, verificando cuotas, amortización, gastos y diagnósticos.

### Compilar para producción
```bash
pnpm build
```

### Compilar para GitHub Pages
```bash
pnpm run build:gh-pages
```
Genera los binarios en `dist/spanish-mortgage-planner/browser` con la ruta base ajustada: `--base-href /spanish-mortgage-planner/`.

---

## 🌐 Despliegue en GitHub Pages

El proyecto incluye un flujo de trabajo de GitHub Actions en [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Para activarlo en el repositorio de GitHub:
1. Ve a los **Settings** de tu repositorio en GitHub.
2. Accede a **Pages** (en el menú lateral izquierdo).
3. En **Build and deployment > Source**, selecciona **GitHub Actions**.
4. Al hacer `git push origin main`, el workflow compilará la aplicación y la publicará automáticamente en:
   `https://<tu-usuario>.github.io/spanish-mortgage-planner/`
