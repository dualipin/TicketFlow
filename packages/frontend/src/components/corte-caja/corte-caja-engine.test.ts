import { describe, expect, it } from 'bun:test';
import {
  calcularTotalDenominaciones,
  formatearDesgloseDenominaciones,
  formatCurrencyMxn,
  evaluarArqueo,
  type ConteoDenominaciones,
} from './corte-caja-engine.ts';

describe('Corte de Caja Engine - Cálculos y Reglas Financieras', () => {
  describe('calcularTotalDenominaciones', () => {
    it('retorna 0 para conteo vacío o con valores en cero', () => {
      expect(calcularTotalDenominaciones({})).toBe(0);
      expect(calcularTotalDenominaciones({ 500: 0, 100: 0, 0.5: 0 })).toBe(0);
    });

    it('suma correctamente fajos de billetes', () => {
      const conteo: ConteoDenominaciones = {
        1000: 2, // 2000
        500: 3,  // 1500
        200: 4,  // 800
        100: 5,  // 500
        50: 6,   // 300
        20: 10,  // 200
      };
      expect(calcularTotalDenominaciones(conteo)).toBe(5300);
    });

    it('calcula monedas y centavos ($0.50) con precisión exacta sin artefactos de flotante', () => {
      const conteo: ConteoDenominaciones = {
        10: 5,   // 50
        5: 3,    // 15
        2: 4,    // 8
        1: 7,    // 7
        0.5: 3,  // 1.50
      };
      // 50 + 15 + 8 + 7 + 1.5 = 81.5
      expect(calcularTotalDenominaciones(conteo)).toBe(81.5);
    });

    it('ignora cantidades negativas o valores inválidos', () => {
      const conteo = {
        100: -2,
        50: 3,
      } as any;
      expect(calcularTotalDenominaciones(conteo)).toBe(150);
    });
  });

  describe('formatearDesgloseDenominaciones', () => {
    it('retorna cadena vacía cuando no hay denominaciones contadas', () => {
      expect(formatearDesgloseDenominaciones({})).toBe('');
      expect(formatearDesgloseDenominaciones({ 100: 0 })).toBe('');
    });

    it('formatea el desglose en orden descendente de mayor a menor denominación', () => {
      const conteo: ConteoDenominaciones = {
        0.5: 4,
        500: 2,
        20: 5,
        100: 1,
      };
      const formatted = formatearDesgloseDenominaciones(conteo);
      expect(formatted).toBe('2×$500, 1×$100, 5×$20, 4×$0.50');
    });
  });

  describe('formatCurrencyMxn', () => {
    it('formatea cifras con signo de pesos y dos decimales', () => {
      const formatted = formatCurrencyMxn(1250.5);
      expect(formatted).toContain('1,250.50');
      expect(formatted).toContain('$');
    });
  });

  describe('evaluarArqueo - Bandas de Tolerancia y Salvaguardas', () => {
    it('bloquea el cierre si el monto real no ha sido ingresado', () => {
      const evalResult = evaluarArqueo({
        montoEsperado: 1000,
        montoReal: null,
      });
      expect(evalResult.puedeCerrar).toBe(false);
      expect(evalResult.motivoBloqueo).toBeTruthy();
    });

    it('permite cierre directo cuando el cuadre es exacto ($0 diferencia)', () => {
      const evalResult = evaluarArqueo({
        montoEsperado: 2500,
        montoReal: 2500,
      });
      expect(evalResult.diferencia).toBe(0);
      expect(evalResult.absDiferencia).toBe(0);
      expect(evalResult.banda).toBe('CUADRADO_O_TOLERANCIA');
      expect(evalResult.requiereNotaJustificacion).toBe(false);
      expect(evalResult.requiereConfirmacionCritica).toBe(false);
      expect(evalResult.puedeCerrar).toBe(true);
    });

    it('clasifica diferencias dentro de la Banda 1 (<= $20 MXN) como tolerancia operativa', () => {
      const sobranteLeve = evaluarArqueo({
        montoEsperado: 1000,
        montoReal: 1018.5,
      });
      expect(sobranteLeve.diferencia).toBe(18.5);
      expect(sobranteLeve.banda).toBe('CUADRADO_O_TOLERANCIA');
      expect(sobranteLeve.requiereNotaJustificacion).toBe(false);
      expect(sobranteLeve.puedeCerrar).toBe(true);

      const faltanteLeve = evaluarArqueo({
        montoEsperado: 1000,
        montoReal: 980, // diff: -20
      });
      expect(faltanteLeve.diferencia).toBe(-20);
      expect(faltanteLeve.absDiferencia).toBe(20);
      expect(faltanteLeve.banda).toBe('CUADRADO_O_TOLERANCIA');
      expect(faltanteLeve.puedeCerrar).toBe(true);
    });

    it('clasifica diferencias en Banda 2 ($20.01 a $100 MXN) y exige justificación escrita', () => {
      const sinNota = evaluarArqueo({
        montoEsperado: 1000,
        montoReal: 950, // diff: -50
        notas: '',
      });
      expect(sinNota.banda).toBe('DESCUADRE_MODERADO');
      expect(sinNota.requiereNotaJustificacion).toBe(true);
      expect(sinNota.requiereConfirmacionCritica).toBe(false);
      expect(sinNota.puedeCerrar).toBe(false);
      expect(sinNota.motivoBloqueo).toContain('justificación');

      const notaCorta = evaluarArqueo({
        montoEsperado: 1000,
        montoReal: 950,
        notas: 'falto', // 5 caracteres < 10
      });
      expect(notaCorta.puedeCerrar).toBe(false);

      const conNotaValida = evaluarArqueo({
        montoEsperado: 1000,
        montoReal: 950,
        notas: 'Faltó cambio en monedas al cliente del folio TK-102',
      });
      expect(conNotaValida.puedeCerrar).toBe(true);
    });

    it('clasifica diferencias en Banda 3 (> $100 MXN) y exige justificación Y confirmación explícita de auditoría', () => {
      const sinConfirmacion = evaluarArqueo({
        montoEsperado: 1500,
        montoReal: 1000, // diff: -500
        notas: 'Se entregó refacción de urgencia sin registrar ticket aún',
        confirmacionCriticaAceptada: false,
      });
      expect(sinConfirmacion.banda).toBe('DESCUADRE_CRITICO');
      expect(sinConfirmacion.requiereNotaJustificacion).toBe(true);
      expect(sinConfirmacion.requiereConfirmacionCritica).toBe(true);
      expect(sinConfirmacion.puedeCerrar).toBe(false);
      expect(sinConfirmacion.motivoBloqueo).toContain('responsabilidad');

      const confirmado = evaluarArqueo({
        montoEsperado: 1500,
        montoReal: 1000,
        notas: 'Se entregó refacción de urgencia sin registrar ticket aún',
        confirmacionCriticaAceptada: true,
      });
      expect(confirmado.puedeCerrar).toBe(true);
    });
  });
});
