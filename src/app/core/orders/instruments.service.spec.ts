import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import {
  CONTRACT_TYPES_API_URL,
  INSTRUMENTS_API_URL,
} from '@core/orders/instruments-api.config';
import { InstrumentsService } from '@core/orders/instruments.service';

describe('InstrumentsService', () => {
  let service: InstrumentsService;
  let httpCtrl: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InstrumentsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(InstrumentsService);
    httpCtrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpCtrl.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should build symbol→contractSize map from instruments and contract-types', async () => {
    const instruments = [
      { symbol: 'BTCUSD', contractType: 0 },
      { symbol: 'ADAUSD', contractType: 4 },
    ];
    const contractTypes = [
      { contractType: 0, contractSize: 1 },
      { contractType: 4, contractSize: 10000 },
    ];

    const mapPromise = firstValueFrom(service.loadContractSizes());

    const instReq = httpCtrl.expectOne(INSTRUMENTS_API_URL);
    const ctReq = httpCtrl.expectOne(CONTRACT_TYPES_API_URL);
    instReq.flush(instruments);
    ctReq.flush(contractTypes);

    const map = await mapPromise;
    expect(map.get('BTCUSD')).toBe(1);
    expect(map.get('ADAUSD')).toBe(10000);
    expect(service.contractSizes().get('BTCUSD')).toBe(1);
  });

  it('should return 1 for unknown symbol via getContractSize', () => {
    expect(service.getContractSize('UNKNOWN')).toBe(1);
  });
});
