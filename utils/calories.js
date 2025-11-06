/**
 * Utilitários para cálculo de calorias baseado em METs (Metabolic Equivalent of Task)
 * 
 * Baseado em fórmulas científicas amplamente aceitas para estimativa de gasto calórico
 * durante exercícios físicos.
 */

/**
 * Calcula o valor MET baseado na velocidade média (km/h)
 * @param {number} speedKmh - Velocidade em km/h
 * @returns {number} - Valor MET correspondente
 */
export function getMETFromSpeed(speedKmh) {
  // Tabela de METs baseada na velocidade
  // Valores baseados em compêndio de atividades físicas (Compendium of Physical Activities)
  
  if (speedKmh < 3.2) {
    // Caminhada muito lenta / parado
    return 2.0;
  } else if (speedKmh >= 3.2 && speedKmh < 4.0) {
    // Caminhada lenta
    return 2.5;
  } else if (speedKmh >= 4.0 && speedKmh < 5.0) {
    // Caminhada moderada
    return 3.0;
  } else if (speedKmh >= 5.0 && speedKmh < 6.5) {
    // Caminhada rápida
    return 4.0;
  } else if (speedKmh >= 6.5 && speedKmh < 8.0) {
    // Caminhada muito rápida / trote leve
    return 6.0;
  } else if (speedKmh >= 8.0 && speedKmh < 9.5) {
    // Corrida leve / trote
    return 8.0;
  } else if (speedKmh >= 9.5 && speedKmh < 11.0) {
    // Corrida moderada
    return 10.0;
  } else if (speedKmh >= 11.0 && speedKmh < 13.0) {
    // Corrida rápida
    return 12.5;
  } else if (speedKmh >= 13.0 && speedKmh < 16.0) {
    // Corrida muito rápida
    return 14.0;
  } else {
    // Corrida de alta velocidade / sprint
    return 16.0;
  }
}

/**
 * Calcula a Taxa Metabólica Basal (TMB) usando a fórmula de Mifflin-St Jeor
 * Considerada mais precisa que Harris-Benedict para pessoas modernas
 * 
 * @param {number} weight - Peso em kg
 * @param {number} height - Altura em cm
 * @param {number} age - Idade em anos
 * @param {string} gender - 'male' | 'female'
 * @returns {number} - TMB em kcal/dia
 */
export function calculateBMR(weight, height, age, gender) {
  // Converter altura de cm para metros
  const heightInMeters = height / 100;
  
  // Fórmula de Mifflin-St Jeor
  // Homens: TMB = 10 × peso(kg) + 6.25 × altura(cm) - 5 × idade(anos) + 5
  // Mulheres: TMB = 10 × peso(kg) + 6.25 × altura(cm) - 5 × idade(anos) - 161
  
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Calcula calorias queimadas durante o exercício usando METs
 * Fórmula: Calorias = MET × Peso(kg) × Duração(horas)
 * 
 * @param {number} met - Valor MET da atividade
 * @param {number} weight - Peso em kg
 * @param {number} durationMinutes - Duração em minutos
 * @returns {number} - Calorias queimadas (kcal)
 */
export function calculateCaloriesBurned(met, weight, durationMinutes) {
  if (durationMinutes <= 0 || weight <= 0) return 0;
  
  const durationHours = durationMinutes / 60;
  return met * weight * durationHours;
}

/**
 * Calcula calorias totais (exercício + TMB durante o exercício)
 * 
 * @param {number} met - Valor MET da atividade
 * @param {number} weight - Peso em kg
 * @param {number} height - Altura em cm
 * @param {number} age - Idade em anos
 * @param {string} gender - 'male' | 'female'
 * @param {number} durationMinutes - Duração em minutos
 * @returns {object} - { total: número, exercise: número, bmr: número }
 */
export function calculateTotalCalories(met, weight, height, age, gender, durationMinutes) {
  // Calorias do exercício (gasto extra)
  const exerciseCalories = calculateCaloriesBurned(met, weight, durationMinutes);
  
  // TMB durante o exercício (o que o corpo queimaria mesmo em repouso)
  const bmrPerDay = calculateBMR(weight, height, age, gender);
  const bmrPerMinute = bmrPerDay / (24 * 60); // TMB por minuto
  const bmrDuringExercise = bmrPerMinute * durationMinutes;
  
  // Total = exercício + TMB durante o exercício
  const totalCalories = exerciseCalories + bmrDuringExercise;
  
  return {
    total: Math.round(totalCalories),
    exercise: Math.round(exerciseCalories),
    bmr: Math.round(bmrDuringExercise),
  };
}

/**
 * Calcula calorias queimadas durante uma corrida
 * Função principal que combina tudo
 * 
 * @param {number} distanceKm - Distância percorrida em km
 * @param {number} durationMinutes - Duração em minutos
 * @param {number} weight - Peso em kg
 * @param {number} height - Altura em cm
 * @param {number} age - Idade em anos
 * @param {string} gender - 'male' | 'female'
 * @param {boolean} includeBMR - Se true, inclui TMB no total (padrão: false, só exercício)
 * @returns {object} - { total: número, exercise: número, bmr: número, met: número, speed: número }
 */
export function calculateRunCalories(
  distanceKm,
  durationMinutes,
  weight,
  height,
  age,
  gender,
  includeBMR = false
) {
  if (distanceKm <= 0 || durationMinutes <= 0) {
    return {
      total: 0,
      exercise: 0,
      bmr: 0,
      met: 0,
      speed: 0,
    };
  }
  
  // Calcular velocidade média em km/h
  const speedKmh = (distanceKm / durationMinutes) * 60;
  
  // Obter MET baseado na velocidade
  const met = getMETFromSpeed(speedKmh);
  
  if (includeBMR) {
    // Calcular calorias totais (exercício + TMB)
    const calories = calculateTotalCalories(met, weight, height, age, gender, durationMinutes);
    return {
      ...calories,
      met: Math.round(met * 10) / 10, // Arredondar para 1 casa decimal
      speed: Math.round(speedKmh * 10) / 10, // Arredondar para 1 casa decimal
    };
  } else {
    // Apenas calorias do exercício (gasto extra)
    const exerciseCalories = calculateCaloriesBurned(met, weight, durationMinutes);
    return {
      total: Math.round(exerciseCalories),
      exercise: Math.round(exerciseCalories),
      bmr: 0,
      met: Math.round(met * 10) / 10,
      speed: Math.round(speedKmh * 10) / 10,
    };
  }
}

/**
 * Calcula ritmo de queima de calorias (calorias por minuto)
 * 
 * @param {number} calories - Total de calorias queimadas
 * @param {number} durationMinutes - Duração em minutos
 * @returns {number} - Calorias por minuto
 */
export function calculateCaloriesPerMinute(calories, durationMinutes) {
  if (durationMinutes <= 0) return 0;
  return Math.round((calories / durationMinutes) * 10) / 10; // Arredondar para 1 casa decimal
}

