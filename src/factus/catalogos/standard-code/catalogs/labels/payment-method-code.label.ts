import { PaymentMethodCode } from "../enum/payment-method-code.enum";

export const PaymentMethodCodeLabels = {
    [PaymentMethodCode.MEDIO_NO_DEFINIDO]: 'Medio no definido',
    [PaymentMethodCode.EFECTIVO]: 'Efectivo',
    [PaymentMethodCode.CHEQUE]: 'Cheque',
    [PaymentMethodCode.CONSIGNACION]: 'Consignación',
    [PaymentMethodCode.TRANSFERENCIA]: 'Transferencia',
    [PaymentMethodCode.TARJETA_CREDITO]: 'Tarjeta de crédito',
    [PaymentMethodCode.TARJETA_DEBITO]: 'Tarjeta débito',
    [PaymentMethodCode.BONOS]: 'Bonos',
    [PaymentMethodCode.VALES]: 'Vales',
    [PaymentMethodCode.OTRO]: 'Otro',
  };