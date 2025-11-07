# 🏃 Running Well

Um aplicativo mobile moderno e completo para rastreamento de corridas desenvolvido com React Native e Expo.

## 📱 Sobre o Projeto

Running Well é um aplicativo de fitness focado em corrida que permite aos usuários rastrear suas corridas em tempo real usando GPS, definir metas de corrida (diárias, semanais ou mensais), acompanhar estatísticas detalhadas e conquistar achievements ao completar objetivos.

### ✨ Funcionalidades Principais

- **Rastreamento GPS em Tempo Real**
  - Mapas interativos com Google Maps
  - Seguimento automático da localização durante a corrida
  - Rastreamento contínuo em segundo plano (background)
  - Funciona mesmo com tela bloqueada ou app em background
  - Foreground service no Android para rastreamento confiável
  - Visualização da rota percorrida em tempo real
  - Marcadores de início e fim da corrida
  - Placeholder profissional durante inicialização do GPS
  - Filtragem inteligente de ruído GPS e detecção de saltos

- **Estatísticas Detalhadas**
  - Distância total percorrida
  - Tempo de corrida
  - Ritmo médio (min/km)
  - Velocidade média (km/h)
  - Calorias queimadas (baseado em METs e dados pessoais)
  - Estatísticas semanais e mensais (incluindo calorias)
  - Melhor corrida registrada

- **Sistema de Metas**
  - Metas diárias, semanais ou mensais
  - Acompanhamento visual de progresso
  - Notificações ao completar metas
  - Reset automático ao criar nova meta

- **Sistema de Conquistas**
  - Achievements desbloqueados ao completar metas
  - Histórico de conquistas
  - Visualização de achievements por tipo

- **Histórico de Corridas**
  - Lista completa de todas as corridas
  - Visualização detalhada de cada corrida
  - Mapa da rota percorrida
  - Gráfico de análise de ritmo (pace) ao longo do tempo
  - Estatísticas individuais por corrida
  - Calorias queimadas por corrida
  - Opção de deletar corridas

- **Perfil do Usuário**
  - Configuração de parâmetros pessoais (nome, peso, altura, idade, gênero)
  - Parâmetros usados para cálculo preciso de calorias
  - Interface totalmente em português
  - Configuração de metas
  - Visualização de conquistas

- **Interface Moderna**
  - Suporte a tema claro/escuro automático
  - Design responsivo e intuitivo
  - Animações suaves
  - Placeholder profissional durante carregamento do GPS
  - Navegação livre durante corrida ativa (rastreamento continua em background)
  - Banner de corrida ativa na tela inicial
  - Layout otimizado para evitar sobreposição com botões do sistema

## 🛠️ Tecnologias Utilizadas

### Core
- **React Native** 0.81.5
- **Expo** ~54.0.22
- **React** 19.1.0
- **Expo Router** ~6.0.14 (Navegação baseada em arquivos)

### Mapas e Localização
- **react-native-maps** 1.20.1
- **expo-location** ~19.0.7
- **expo-task-manager** (Rastreamento nativo em background)

### Estilização
- **NativeWind** ^4.1.23 (Tailwind CSS para React Native)
- **Tailwind CSS** ^3.4.17

### Armazenamento
- **@react-native-async-storage/async-storage** 2.2.0

### Navegação
- **@react-navigation/native** ^7.1.8
- **@react-navigation/bottom-tabs** ^7.4.0

### Gráficos e Visualização
- **react-native-gifted-charts** (Gráficos interativos)
- **expo-linear-gradient** (Gradientes para gráficos)
- **react-native-svg** 15.12.1 (Suporte SVG)

### Outras Bibliotecas
- **expo-haptics** ~15.0.7 (Feedback tátil)
- **react-native-reanimated** ~4.1.1 (Animações)
- **react-native-gesture-handler** ~2.28.0 (Gestos)
- **@expo/vector-icons** ^15.0.3 (Ícones)

## 📁 Estrutura do Projeto

```
running_well/
├── app/                          # Rotas da aplicação (Expo Router)
│   ├── (tabs)/                   # Navegação por abas
│   │   ├── index.jsx            # Tela inicial (Home)
│   │   ├── history.jsx           # Histórico de corridas
│   │   ├── stats.jsx            # Estatísticas
│   │   ├── profile.jsx          # Perfil do usuário
│   │   └── _layout.jsx          # Layout das abas
│   ├── current-run.jsx          # Tela de corrida ativa
│   ├── run-details.jsx         # Detalhes de uma corrida
│   ├── goal-settings.jsx       # Configuração de metas
│   ├── personal-parameters.jsx  # Parâmetros pessoais
│   ├── achievements.jsx        # Conquistas
│   └── _layout.jsx             # Layout raiz
├── components/                   # Componentes reutilizáveis
│   ├── GoogleMapView.jsx        # Componente do mapa
│   ├── PaceChart.jsx            # Componente de gráfico de pace
│   └── ui/                      # Componentes de UI
├── context/                      # Contextos React (Estado global)
│   ├── RunContext.jsx          # Contexto de corridas
│   ├── SettingsContext.jsx     # Contexto de configurações
│   ├── AchievementsContext.jsx # Contexto de conquistas
│   └── LocationTrackingProvider.jsx # Contexto de rastreamento GPS (global)
├── hooks/                        # Hooks customizados
│   ├── useLocationTracking.jsx # Hook que consome LocationTrackingProvider
│   └── use-color-scheme.jsx    # Hook de tema
├── utils/                        # Funções utilitárias
│   ├── calories.js             # Funções de cálculo de calorias (METs)
│   └── logger.js                # Sistema de logs para debugging
├── tasks/                       # Tasks nativas em background
│   └── backgroundLocationTask.js # Task de rastreamento GPS em background
├── assets/                       # Recursos estáticos
│   └── images/                 # Imagens do app
├── app/                          # Rotas adicionais
│   └── debug-logs.jsx          # Tela de visualização de logs
├── app.json                     # Configuração do Expo
├── eas.json                     # Configuração do EAS Build
└── package.json                 # Dependências do projeto
```

## 🚀 Como Começar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Conta no Expo (opcional, para builds)
- Google Maps API Key (para mapas)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Tosi10/Running_Well.git
cd Running_Well
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a Google Maps API Key:
   - Obtenha uma chave em [Google Cloud Console](https://console.cloud.google.com/)
   - Edite `app.json` e adicione sua chave:
   ```json
   "ios": {
     "config": {
       "googleMapsApiKey": "SUA_CHAVE_AQUI"
     }
   },
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "SUA_CHAVE_AQUI"
       }
     }
   }
   ```

4. Inicie o servidor de desenvolvimento:
```bash
npx expo start
```

### Executando em Dispositivos

#### Android
```bash
# Com emulador Android
npx expo start --android

# Ou escaneie o QR code com Expo Go
```

#### iOS
```bash
# Com simulador iOS (apenas macOS)
npx expo start --ios

# Ou escaneie o QR code com Expo Go
```

## 📦 Build e Deploy

### Desenvolvimento

Para testar em desenvolvimento:
```bash
npx expo start
```

### Build de Produção

#### Android (APK)
```bash
# Build preview
npx eas build --platform android --profile preview

# Build production
npx eas build --platform android --profile production
```

#### iOS (TestFlight)
```bash
# Build production
npx eas build --platform ios --profile production

# Submit para TestFlight
npx eas submit --platform ios --profile production
```

### Configuração do EAS Build

O projeto está configurado com EAS Build. Certifique-se de ter:
- Conta Expo configurada
- EAS CLI instalado (`npm install -g eas-cli`)
- Login feito (`eas login`)

## 🔧 Configurações

### Permissões

O app requer as seguintes permissões:

#### iOS
- **NSLocationWhenInUseUsageDescription**: Localização durante o uso do app
- **NSLocationAlwaysAndWhenInUseUsageDescription**: Localização sempre (incluindo background)
- **NSLocationAlwaysUsageDescription**: Localização em background
- **UIBackgroundModes**: `["location"]` - Permite rastreamento em segundo plano

#### Android
- **ACCESS_FINE_LOCATION**: Localização precisa (GPS)
- **ACCESS_COARSE_LOCATION**: Localização aproximada
- **ACCESS_BACKGROUND_LOCATION**: Localização em segundo plano
- **FOREGROUND_SERVICE**: Serviço em primeiro plano
- **FOREGROUND_SERVICE_LOCATION**: Serviço de localização em primeiro plano

### Bundle IDs

- **iOS**: `com.runningwell.app`
- **Android**: `com.runningwell.app`

### Configurações de Rastreamento GPS

O app utiliza configurações otimizadas para rastreamento preciso:

- **Sistema de Rastreamento**: TaskManager (expo-task-manager) para rastreamento nativo em background
- **Precisão**: `Location.Accuracy.BestForNavigation` - Máxima precisão para navegação
- **Intervalo de Tempo**: 500ms (0.5 segundos) - Atualizações muito frequentes para precisão máxima
- **Intervalo de Distância**: 5-10 metros - Novo ponto a cada 5-10 metros percorridos
- **Filtragem de Ruído**: 
  - Mínimo: 0.1 metros (0.0001 km) - Captura movimentos muito pequenos para precisão em curvas
  - Máximo: 200 metros (0.2 km) - Ignora saltos de GPS durante movimento rápido
- **Foreground Service (Android)**: Notificação persistente durante rastreamento
- **Sincronização**: Sincronização automática a cada 1-2 segundos quando app está em foreground
- **Persistência**: Auto-save automático de corridas em andamento para evitar perda de dados
- **Background Tracking**: Funciona mesmo com app completamente fechado ou tela bloqueada

## 🎨 Funcionalidades Detalhadas

### Rastreamento de Corrida

- **Início/Pausa**: Controle total sobre o rastreamento
- **Rastreamento em Background**: Continua funcionando mesmo quando:
  - O app está em segundo plano
  - A tela está bloqueada
  - O usuário navega para outras telas do app
- **Parada**: Opção de zerar corrida com confirmação (só funciona se houver corrida ativa)
- **Finalização**: Salva corrida no histórico com todos os dados
- **Precisão**: 
  - Filtragem inteligente de ruído GPS
  - Detecção e ignorância de saltos de GPS
  - Cálculo preciso de distância usando fórmula de Haversine
- **Estado Persistente**: O estado da corrida é mantido globalmente, permitindo navegação livre

### Sistema de Metas

- **Tipos**: Diária, Semanal, Mensal
- **Progresso Visual**: Barra de progresso em tempo real
- **Reset Inteligente**: Ao criar nova meta, conta apenas corridas após a criação
- **Conquistas**: Desbloqueio automático ao completar metas

### Estatísticas

- **Total**: Distância total, tempo total, número de corridas, calorias totais
- **Semanal**: Estatísticas da semana atual, incluindo calorias
- **Mensal**: Estatísticas do mês atual, incluindo calorias
- **Melhor Corrida**: Maior distância registrada

### Cálculo de Calorias

- **Base Científica**: Utiliza o conceito de MET (Metabolic Equivalent of Task)
- **Fórmula**: `Calorias (kcal) = MET × Peso (kg) × Duração (horas)`
- **Dados Utilizados**: Peso, altura, idade, gênero, distância e tempo da corrida
- **Cálculo em Tempo Real**: Exibição dinâmica de calorias durante a corrida
- **Integração Completa**: Calorias salvas com a corrida e exibidas em histórico, detalhes e estatísticas

### Análise de Ritmo (Pace)

- **Coleta Automática**: Dados coletados a cada 30 segundos ou 500 metros durante a corrida
- **Gráfico Interativo**: Visualização do ritmo ao longo do tempo na tela de detalhes
- **Estatísticas de Ritmo**: 
  - Ritmo médio da corrida
  - Ritmo mais rápido alcançado
  - Ritmo mais lento registrado
- **Visualização**: Gráfico de linha com área preenchida mostrando variações de ritmo

## 🆕 Melhorias Recentes

### Versão Atual

- ✅ **Rastreamento GPS Totalmente Funcional e Otimizado** 🎯
  - **GPS FUNCIONANDO PERFEITAMENTE EM BACKGROUND** - Testado e validado em condições reais
  - Implementação robusta com TaskManager (expo-task-manager) para rastreamento nativo em background
  - Rastreamento contínuo mesmo com app fechado, tela bloqueada ou em segundo plano
  - Sincronização automática de pontos coletados em background ao retornar ao app
  - Refatoração completa do sistema de rastreamento para contexto global
  - Suporte completo para rastreamento em background (iOS e Android)
  - Foreground service no Android para rastreamento confiável
  - Filtragem aprimorada de ruído GPS com thresholds otimizados (0.1m mínimo, 200m máximo)
  - Captura precisa de curvas e movimentos detalhados
  - Intervalos otimizados: 500ms de tempo e 5-10m de distância para máxima precisão
  - Persistência automática de corridas em andamento (auto-save/restore)
  - Sistema de logs detalhado para debugging
  - Coleta automática de dados de pace durante a corrida

- ✅ **Sistema de Análise de Ritmo (Pace)**
  - Coleta automática de dados de pace a cada 30 segundos ou 500 metros
  - Gráfico interativo de ritmo na tela de detalhes da corrida
  - Visualização de ritmo médio, mais rápido e mais lento
  - Gráfico de linha com área preenchida mostrando variações
  - Suporte completo a tema claro/escuro

- ✅ **Cálculo de Calorias Baseado em METs**
  - Implementação científica usando MET (Metabolic Equivalent of Task)
  - Cálculo em tempo real durante a corrida
  - Utiliza dados pessoais (peso, altura, idade, gênero) para precisão
  - Exibição de calorias em todas as telas (corrida ativa, histórico, detalhes, estatísticas)
  - Integração completa com sistema de salvamento de corridas

- ✅ **Melhorias de UX/UI**
  - Interface totalmente traduzida para português
  - Placeholder profissional durante carregamento do GPS
  - Banner de corrida ativa na tela inicial
  - Navegação livre durante corrida (rastreamento continua)
  - Layout otimizado para diferentes tamanhos de tela
  - Ajuste automático de zoom no mapa para visualização de rotas salvas
  - Exibição de calorias em cards de corridas recentes e histórico

- ✅ **Sistema de Conquistas**
  - Desbloqueio automático ao completar metas
  - Histórico completo de conquistas
  - Timestamps de desbloqueio

- ✅ **Correções de Bugs**
  - Correção do toggle de meta em goal-settings
  - Reset correto de progresso ao criar nova meta
  - Botão de parar só funciona quando há corrida ativa
  - Limpeza de permissões duplicadas no app.json
  - Correção de erros de renderização com valores null/undefined
  - Validação robusta de dados em todas as telas

## 🐛 Troubleshooting

### Problemas comuns

**GPS não funciona ou para após alguns minutos:**
- Verifique se as permissões de localização estão habilitadas
- No Android, certifique-se de permitir "Localização em segundo plano"
- No iOS, permita "Sempre" quando solicitado
- Teste em dispositivo físico (GPS não funciona bem em emuladores)
- Verifique se a localização está ativada no dispositivo
- Reinicie o app se o rastreamento parar

**Mapa não carrega ou demora muito:**
- Verifique se a Google Maps API Key está configurada corretamente
- Confirme que a chave tem permissões para Maps SDK (Android e iOS)
- Verifique sua conexão com a internet
- Aguarde alguns segundos na primeira inicialização (GPS precisa de tempo)

**Rastreamento para quando app vai para background:**
- No Android: Verifique se a permissão de "Localização em segundo plano" foi concedida
- No iOS: Certifique-se de ter selecionado "Sempre" nas configurações de localização
- Verifique se o foreground service está funcionando (notificação deve aparecer no Android)

**Build falha:**
- Execute `npx expo install --fix` para corrigir dependências
- Limpe o cache: `npx expo start -c`
- Verifique se todas as configurações no `app.json` estão corretas
- Para iOS: Certifique-se de que o build number foi incrementado

**Gráfico de pace não aparece:**
- Certifique-se de que a corrida teve duração suficiente (pelo menos 1-2 minutos)
- Verifique se os dados de pace foram coletados (aparecem apenas se houver movimento)
- Reinicie o app se o gráfico não aparecer após uma corrida válida

**Erro de "Text strings must be rendered within a <Text> component":**
- Geralmente ocorre quando um valor `null`, `undefined` ou um número é renderizado diretamente fora de um componente `<Text>`.
- Verifique se todos os dados exibidos estão dentro de `<Text>` e se são convertidos para `String()` se forem numéricos ou `null`/`undefined`.
- Limpe o cache do aplicativo ou os dados do AsyncStorage para remover corridas com dados corrompidos.
- **Corrigido**: Implementada validação robusta em todas as telas para prevenir este erro.

## ✅ Status do Projeto - Pronto para Build

### Confirmação de Funcionalidades

- ✅ **GPS Totalmente Funcional e Testado** 🎯: 
  - Rastreamento testado e validado em condições reais de corrida
  - Funcionando perfeitamente em background, com app fechado, tela bloqueada e durante navegação
  - Captura precisa de curvas e movimentos detalhados
  - Sincronização automática de pontos coletados em background
  - Sistema robusto com TaskManager para rastreamento nativo
- ✅ **Cálculo de Calorias**: Implementado e funcionando com base em METs e dados pessoais
- ✅ **Gráfico de Pace**: Sistema completo de análise de ritmo implementado e funcionando
- ✅ **Todas as Funcionalidades**: Sistema de metas, conquistas, histórico, estatísticas - tudo funcionando
- ✅ **Validação de Dados**: Implementada validação robusta em todas as telas
- ✅ **Sistema de Logs**: Logs detalhados para debugging disponíveis na tela de perfil
- ✅ **Dependências**: Todas as bibliotecas necessárias instaladas e configuradas

**O projeto está 100% pronto para build de produção!** 🚀

**GPS funcionando perfeitamente - testado e validado!** ✅

## 📝 Licença

Este projeto é privado e proprietário.

## 👥 Contribuindo

Este é um projeto pessoal. Para sugestões ou problemas, abra uma issue no repositório.

## 📞 Contato

Para dúvidas ou suporte, entre em contato através do repositório GitHub.

---

**Desenvolvido com ❤️ usando React Native e Expo**
