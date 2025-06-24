import { CorrectionCode } from "../enum/correction-code.enum";

export const CorrectionCodeLabels = {
    [CorrectionCode.DEVOLUCION_O_NO_ACEPTACION]: 'Devolución o no aceptación',
    [CorrectionCode.ANULACION_FACTURA]: 'Anulación de factura',
    [CorrectionCode.REBAJA_DESCUENTO]: 'Rebaja o descuento',
    [CorrectionCode.AJUSTE_PRECIO]: 'Ajuste de precio',
    [CorrectionCode.DESCUENTO_PRONTO_PAGO]: 'Descuento por pronto pago',
    [CorrectionCode.DESCUENTO_POR_VOLUMEN]: 'Descuento por volumen',
  };