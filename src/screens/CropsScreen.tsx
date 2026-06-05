import React from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Plus, Calendar, Ruler } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CropsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const crops = [
    { id: 1, name: "Wheat", variety: "HD 3226", sown: "Nov 15", area: "5 Acres", health: "Healthy", progress: 65, color: "bg-green-500" },
    { id: 2, name: "Mustard", variety: "Pusa 31", sown: "Oct 20", area: "2 Acres", health: "Needs Attention", progress: 80, color: "bg-yellow-500" }
  ];

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center py-2">
        <h1 className="text-2xl font-bold text-gray-800">{t('crops')}</h1>
        <button className="bg-primary text-white p-2 rounded-full shadow-md">
          <Plus size={20} />
        </button>
      </header>

      <div className="space-y-4">
        {crops.map(crop => (
          <div key={crop.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100" onClick={() => navigate(`/crops/${crop.id}`)}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center text-primary">
                  <Leaf size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{crop.name}</h3>
                  <p className="text-xs text-gray-500">{crop.variety}</p>
                </div>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-gray-50 border border-gray-100 ${crop.health === 'Healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
                {crop.health}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>Sown: {crop.sown}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Ruler size={16} className="text-gray-400" />
                <span>{crop.area}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium text-gray-600">
                <span>Growth Stage</span>
                <span>{crop.progress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${crop.color}`} style={{ width: `${crop.progress}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
