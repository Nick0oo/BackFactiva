import { DocumentRangeType } from "../enum/document-range-type.enum";

export const DocumentRangeTypeLabels = {
    [DocumentRangeType.FACTURA_VENTA]: 'Factura de venta',
    [DocumentRangeType.NOTA_CREDITO]: 'Nota crédito',
    [DocumentRangeType.NOTA_DEBITO]: 'Nota débito',
    [DocumentRangeType.DOCUMENTO_SOPORTE]: 'Documento soporte',
    [DocumentRangeType.NOTA_AJUSTE_SOPORTE]: 'Nota de ajuste soporte',
    [DocumentRangeType.NOMINA]: 'Nómina',
    [DocumentRangeType.NOTA_AJUSTE_NOMINA]: 'Nota de ajuste nómina',
    [DocumentRangeType.ELIMINACION_NOMINA]: 'Eliminación de nómina',
    [DocumentRangeType.FACTURA_PAPEL]: 'Factura papel',
  };