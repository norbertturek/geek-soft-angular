import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { InstrumentsService } from '@core/orders/instruments.service';

const TEST_INSTRUMENTS_URL = 'https://test.example/instruments.json';
const TEST_CONTRACT_TYPES_URL = 'https://test.example/contract-types.json';

describe('InstrumentsService', () => {
  let service: InstrumentsService;
  let httpCtrl: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InstrumentsService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: APP_CONFIG,
          useValue: {
            production: false,
            ordersUrl: '',
            instrumentsUrl: TEST_INSTRUMENTS_URL,
            contractTypesUrl: TEST_CONTRACT_TYPES_URL,
            quotesWsUrl: '',
            wsPingIntervalMs: 15000,
            wsReconnectDelayMs: 1000,
          },
        },
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

    const instReq = httpCtrl.expectOne(TEST_INSTRUMENTS_URL);
    const ctReq = httpCtrl.expectOne(TEST_CONTRACT_TYPES_URL);
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

  it('should set error and loading false when fetch fails', async () => {
    const mapPromise = firstValueFrom(service.loadContractSizes()).catch(
      () => null
    );
    const instReq = httpCtrl.expectOne(TEST_INSTRUMENTS_URL);
    const ctReq = httpCtrl.expectOne(TEST_CONTRACT_TYPES_URL);
    ctReq.flush([]); // complete first so forkJoin doesn't cancel it
    instReq.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    await mapPromise;
    expect(service.error()).toBeTruthy();
    expect(service.loading()).toBe(false);
  });
});
