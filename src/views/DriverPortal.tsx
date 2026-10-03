import React, { useState, useEffect } from 'react';
import {
  Bike,
  MapPin,
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Phone,
  Power,
  Navigation,
} from 'lucide-react';
import { Delivery, DeliveryDriver } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  fetchDeliveries,
  fetchDeliveryDrivers,
  saveDeliveryDriver,
  acceptDelivery,
  updateDeliveryStep,
} from '../services/firestoreService';

export const DriverPortal: React.FC = () => {
  const { userProfile } = useAuth();
  const [driver, setDriver] = useState<DeliveryDriver | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const drivers = await fetchDeliveryDrivers();
      let current = drivers.find((d) => d.ownerUid === userProfile?.uid);
      if (!current && drivers.length > 0) {
        current = drivers[0];
      }
      setDriver(current || null);

      const allDeliveries = await fetchDeliveries();
      setDeliveries(allDeliveries);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [userProfile]);

  const handleToggleOnline = async () => {
    if (!driver) return;
    const updated = { ...driver, isOnline: !driver.isOnline };
    setDriver(updated);
    await saveDeliveryDriver(updated);
  };

  const handleAcceptDelivery = async (del: Delivery) => {
    if (!driver) return;
    await acceptDelivery(del.id, driver);
    loadData();
  };

  const handleAdvanceStep = async (del: Delivery) => {
    let nextStatus: Delivery['status'] = 'arrived_pickup';
    if (del.status === 'accepted') nextStatus = 'arrived_pickup';
    else if (del.status === 'arrived_pickup') nextStatus = 'collected';
    else if (del.status === 'collected') nextStatus = 'in_transit';
    else if (del.status === 'in_transit') nextStatus = 'delivered';

    await updateDeliveryStep(del.id, nextStatus);
    loadData();
  };

  const availableDeliveries = deliveries.filter(
    (d) => d.status === 'requested' && (!d.driverId || d.driverId === '')
  );

  const myActiveDeliveries = deliveries.filter(
    (d) => d.driverId === driver?.id && d.status !== 'delivered' && d.status !== 'cancelled'
  );

  const myCompletedDeliveries = deliveries.filter(
    (d) => d.driverId === driver?.id && d.status === 'delivered'
  );

  const totalEarnings = myCompletedDeliveries.reduce((sum, d) => sum + d.driverEarnings, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Driver Header */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xl">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-neutral-900">
                {driver?.name || 'Entregador Parceiro'}
              </h1>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  driver?.isOnline
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {driver?.isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Veículo: {driver?.vehicleType.toUpperCase()} • Placa: {driver?.licensePlate} • Cachoeiras de Macacu
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition shadow-xs ${
            driver?.isOnline
              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{driver?.isOnline ? 'Ficar Offline' : 'Ficar Online para Corridas'}</span>
        </button>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-1">
          <span className="text-xs text-neutral-500 font-medium">Ganhos em Entregas</span>
          <p className="text-2xl font-black text-emerald-700">
            R$ {totalEarnings.toFixed(2).replace('.', ',')}
          </p>
          <span className="text-[11px] text-neutral-400">Total acumulado</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-1">
          <span className="text-xs text-neutral-500 font-medium">Entregas Concluídas</span>
          <p className="text-2xl font-black text-neutral-900">
            {myCompletedDeliveries.length}
          </p>
          <span className="text-[11px] text-neutral-400">Em Cachoeiras de Macacu</span>
        </div>

        <div className="p-5 rounded-3xl bg-orange-50 border border-orange-200 shadow-xs space-y-1">
          <span className="text-xs text-orange-900 font-bold">Corridas Disponíveis Agora</span>
          <p className="text-2xl font-black text-orange-900">
            {availableDeliveries.length}
          </p>
          <span className="text-[11px] text-orange-600 font-medium">Prontas para aceitar</span>
        </div>
      </div>

      {/* ACTIVE DELIVERIES */}
      {myActiveDeliveries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-orange-600" />
            Minhas Corridas em Andamento
          </h2>

          <div className="space-y-4">
            {myActiveDeliveries.map((del) => (
              <div
                key={del.id}
                className="bg-white rounded-3xl border-2 border-orange-400 p-5 shadow-lg space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full inline-block mb-1">
                      Status: {del.status}
                    </span>
                    <h3 className="text-sm font-black text-neutral-900">
                      Coleta em: {del.storeName}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Cliente: <strong>{del.customerName}</strong>
                    </p>
                  </div>

                  <span className="text-base font-black text-emerald-700">
                    Ganho: R$ {del.driverEarnings.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Origem:</strong> {del.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                    <span><strong>Destino:</strong> {del.deliveryAddress}</span>
                  </div>
                </div>

                {/* Progressive action button */}
                <button
                  onClick={() => handleAdvanceStep(del)}
                  className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {del.status === 'accepted' && 'Cheguei na Loja (Ponto de Coleta)'}
                  {del.status === 'arrived_pickup' && 'Confirmar Pacote Coletado'}
                  {del.status === 'collected' && 'Iniciar Rota até a Casa do Cliente'}
                  {del.status === 'in_transit' && 'Cheguei e Entreguei ao Cliente!'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AVAILABLE DISPATCHES FEED */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Chamados de Entrega na Cidade (Aguardando Motoboy)
        </h2>

        {availableDeliveries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center text-xs text-neutral-500">
            Nenhuma nova corrida no radar no momento. Fique online para ser notificado assim que uma loja de Cachoeiras finalizar o preparo de um pedido!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableDeliveries.map((del) => (
              <div
                key={del.id}
                className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-900">
                      {del.storeName}
                    </span>
                    <span className="text-xs font-black text-emerald-700">
                      R$ {del.driverEarnings.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Cliente: {del.customerName}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1 truncate">
                    📍 {del.deliveryAddress}
                  </p>
                </div>

                <button
                  disabled={!driver?.isOnline}
                  onClick={() => handleAcceptDelivery(del)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  {driver?.isOnline ? 'Aceitar Corrida' : 'Fique Online para Aceitar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
