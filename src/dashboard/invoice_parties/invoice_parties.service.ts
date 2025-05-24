import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateInvoicePartyDto } from './dto/update-invoice_party.dto';
import { CreateInvoicePartyDto } from './dto/create-invoice_party.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvoiceParty } from './entities/invoice_party.entity';
import { InvoicePartyDocument } from './entities/invoice_party.entity';
import { IdentityDocumentType } from 'src/factus/catalogos/standard-code/catalogs/enum/identity-document-type.enum';
import { OrganizationType } from 'src/factus/catalogos/standard-code/catalogs/enum/organization-type.enum';
import { CustomerTributeId } from 'src/factus/catalogos/standard-code/catalogs/enum/customer-tribute-id.enum';
import { Municipality } from 'src/factus/catalogos/municipality/dto/municipality.dto';
import { MunicipalityService } from 'src/factus/catalogos/municipality/municipality.service';

@Injectable()
export class InvoicePartiesService {
  constructor(
    @InjectModel(InvoiceParty.name) private readonly invoicePartyModel: Model<InvoicePartyDocument>,
    private readonly municipalityService: MunicipalityService,
  ) { }

  async validateMunicipality(municipalityName: string): Promise<Municipality> {
    const municipality = await this.municipalityService.findByName(municipalityName);
    if (!municipality) {
      throw new NotFoundException(`Municipality with name ${municipalityName} not found`);
    }
    return municipality;
  }

  async create(createInvoicePartyDto: CreateInvoicePartyDto, issuerId): Promise<InvoicePartyDocument> {
    // Paso 1: Verificar que el departamento existe
    const departmentExists = await this.municipalityService.departmentExists(createInvoicePartyDto.department);
    if (!departmentExists) {
      throw new NotFoundException(`Department ${createInvoicePartyDto.department} not found`);
    }
    
    // Paso 2: Buscar el municipio dentro del departamento especificado
    const municipality = await this.municipalityService.findByNameAndDepartment(
      createInvoicePartyDto.municipality_name, // Asumiendo que esto es el nombre del municipio
      createInvoicePartyDto.department
    );
    
    if (!municipality) {
      throw new NotFoundException(
        `Municipality "${createInvoicePartyDto.municipality_id}" not found in department "${createInvoicePartyDto.department}"`
      );
    }
    
    // Obtener el ID del municipio para guardar
    const municipalityId = municipality.id || municipality.code;
    
    // Transformar enums
    const identification_document_id = IdentityDocumentType[createInvoicePartyDto.identification_document_id];
    const tribute_id = CustomerTributeId[createInvoicePartyDto.tribute_id];
    const legal_organization_id = OrganizationType[createInvoicePartyDto.legal_organization_id];
    
    // Preparar datos con el ID del municipio
    const partyData = {
      ...createInvoicePartyDto,
      municipality_id: municipalityId, // Guardar el ID, no el nombre
      municipality_name: createInvoicePartyDto.municipality_id, 
      department: createInvoicePartyDto.department,
      dv: createInvoicePartyDto.dv || null,
      identification_document_id,
      tribute_id,
      legal_organization_id,
      issuerId
    };
    
    const createdInvoiceParty = new this.invoicePartyModel(partyData);
    return await createdInvoiceParty.save();
  }


  async findAllByUser(userId: string): Promise<InvoicePartyDocument[]> {
    return this.invoicePartyModel.find({ issuerId: userId }).exec();
  }

  async findAll(): Promise<InvoicePartyDocument[]> {
    return await this.invoicePartyModel.find().exec();
  }

  async findOne(id: string): Promise<InvoicePartyDocument> {
    const invoiceParty = await this.invoicePartyModel.findById(id).exec();
    if (!invoiceParty) {
      throw new NotFoundException(`InvoiceParty with ID ${id} not found`);
    }
    return invoiceParty;
  }

  async update(
    id: string,
    updateInvoicePartyDto: UpdateInvoicePartyDto,
  ): Promise<InvoicePartyDocument> {
    const updatedInvoiceParty = await this.invoicePartyModel.findByIdAndUpdate(
      id,
      updateInvoicePartyDto,
      { new: true },
    ).exec();
    if (!updatedInvoiceParty) {
      throw new NotFoundException(`InvoiceParty with ID ${id} not found`);
    }
    return updatedInvoiceParty;
  }

  async remove(id: string): Promise<void> {
    const result = await this.invoicePartyModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`InvoiceParty with ID ${id} not found`);
    }
  }

  async verifyReceiverExists(receiverId: string): Promise<boolean> {
    const invoiceParty = await this.invoicePartyModel.findById(receiverId).exec();
    if (!invoiceParty) {
      throw new NotFoundException(`Receiver with ID ${receiverId} not found`);
    }
    return true;
  }


}