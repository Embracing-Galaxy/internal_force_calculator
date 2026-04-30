use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub enum SupportType {
    None,
    Hinge,
    Roller,
    Fixed,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SupportConfig {
    pub support_type: SupportType,
    pub position: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ReactionLoad {
    pub position: f64,
    pub magnitude: f64,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum ReactionResult {
    Success(Vec<Load>),
    Error { error_type: String, message: String },
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum LoadType {
    PointLoad,
    Moment,
    DistributedLoad,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PointLoad {
    pub position: f64,
    pub magnitude: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MomentLoad {
    pub position: f64,
    pub magnitude: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DistributedLoad {
    pub start_position: f64,
    pub end_position: f64,
    pub magnitude: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Load {
    PointLoad(PointLoad),
    Moment(MomentLoad),
    DistributedLoad(DistributedLoad),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DataPoint {
    pub x: f64,
    pub value: f64,
}

impl DataPoint {
    pub fn new(x: f64, value: f64) -> Self {
        DataPoint { x, value }
    }
}

#[derive(Serialize, Deserialize)]
pub struct PrincipalMomentOutput {
    area: f64,
    yc: f64,
    zc: f64,
    imin: f64,
    imax: f64,
    theta: f64,
}

impl PrincipalMomentOutput {
    pub fn new(area: f64, yc: f64, zc: f64, imin: f64, imax: f64, theta: f64) -> Self {
        Self {
            area,
            yc,
            zc,
            imin,
            imax,
            theta,
        }
    }
}
